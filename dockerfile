FROM php:8.4-fpm

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libicu-dev \
    zlib1g-dev \
    unzip \
    zip \
    && docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    xml \
    simplexml \
    xmlreader \
    intl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin \
    --filename=composer

# PHP Configuration
RUN echo "memory_limit = 512M" > /usr/local/etc/php/conf.d/memory-limit.ini && \
    echo "date.timezone = Asia/Jakarta" > /usr/local/etc/php/conf.d/timezone.ini

# Set working directory
WORKDIR /var/www/html

# Copy existing application directory contents
COPY . .

# Copy the CA certificate
COPY cacert.pem /usr/local/etc/ssl/certs/cacert.pem

# Configure Composer to use the CA certificate
RUN composer config --global cafile /usr/local/etc/ssl/certs/cacert.pem

# Install dependencies
RUN composer install --no-progress --prefer-dist --optimize-autoloader

# Generate application key
RUN php artisan key:generate

# Fix permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD ["php-fpm"]
