#!/bin/bash

# Google Cloud Deployment Script for Nihongo Sprinter

echo "🚀 Deploying Nihongo Sprinter to Google Cloud..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Authenticate if needed
echo "🔐 Checking authentication..."
gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@" || {
    echo "Please run: gcloud auth login"
    exit 1
}

# Set project (you'll need to replace with your actual project ID)
PROJECT_ID="your-project-id-here"
echo "📋 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Deploy using Cloud Build
echo "🏗️  Starting deployment..."
gcloud builds submit --config=cloudbuild.yaml

echo "✅ Deployment complete!"
echo "🌐 Your app will be available at: https://nihongo-sprinter-xxxxxxxxx-uc.a.run.app"

# Set environment variables
echo "⚙️  Setting environment variables..."
gcloud run services update nihongo-sprinter \
  --region us-central1 \
  --set-env-vars "GOOGLE_TTS_API_KEY=AIzaSyBjZ27a7opZUaujbT3rN1Ibu63Ug_1yGug"

echo "🎉 All done! Your Nihongo Sprinter is live!"