#!/bin/bash

# Create SSL directory if it doesn't exist
mkdir -p nginx/ssl

# Generate a self-signed SSL certificate
openssl req -x509 \
  -newkey rsa:4096 \
  -nodes \
  -days 365 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Encriptofy/CN=localhost"

# Set proper permissions
chmod 400 nginx/ssl/*.pem

echo "SSL certificates generated successfully in nginx/ssl/ directory"
