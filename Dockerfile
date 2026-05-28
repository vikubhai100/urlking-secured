FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false
COPY . .
RUN npm run build

FROM nginx:alpine

# Production-grade Nginx configuration
RUN cat > /etc/nginx/conf.d/default.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html index.htm;

    # 🔒 Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Resource-Policy "same-origin" always;

    # 🚀 Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/xml
        application/rss+xml
        image/svg+xml
        font/opentype
        font/ttf
        font/woff
        font/woff2;

    # 🚀 Brotli pre-compressed files
    location ~ .*\.br$ {
        add_header Content-Encoding br;
        add_header Content-Type application/javascript;
    }
    location ~ .*\.gz$ {
        add_header Content-Encoding gzip;
        add_header Content-Type application/javascript;
    }

    # 📁 Static assets caching (1 year)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|otf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        try_files $uri =404;
    }

    # 📄 HTML files - no cache (always serve latest)
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        try_files $uri =404;
    }

    # React Router SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 🔒 Block sensitive files
    location ~ /\.(git|env) {
        deny all;
        return 404;
    }

    # 🔒 Block access to source maps in production
    location ~* \.map$ {
        deny all;
        return 404;
    }
}
NGINX_EOF

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
