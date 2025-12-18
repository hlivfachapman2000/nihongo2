# Google Cloud Deployment Guide

## 🚀 Automated Deployment Setup

### 1. Google Cloud Console Setup

1. **Create Cloud Build Trigger**
   - Go to Google Cloud Console → Cloud Build → Triggers
   - Click "Create Trigger"
   - **Name**: `nihongo-sprinter-deploy`
   - **Event**: Push to branch
   - **Source**: GitHub (connect your repo: https://github.com/hlivfachapman2000/nihongo2)
   - **Branch**: `^main$`
   - **Configuration**: `cloudbuild.yaml`

2. **Enable Required APIs**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   ```

### 2. Manual Deployment (Alternative)

```bash
# 1. Set your Google Cloud project ID
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID

# 2. Make deployment script executable
chmod +x deploy.sh

# 3. Run deployment
./deploy.sh
```

### 3. Environment Variables

After first deployment, add TTS API key:

```bash
gcloud run services update nihongo-sprinter \
  --region us-central1 \
  --set-env-vars "GOOGLE_TTS_API_KEY=AIzaSyBjZ27a7opZUaujbT3rN1Ibu63Ug_1yGug"
```

## 📁 Deployment Files

- **`cloudbuild.yaml`** - Docker-based build with Cloud Run deployment
- **`deploy.sh`** - Manual deployment script
- **`app.yaml`** - App Engine configuration (backup option)

## 🔄 CI/CD Pipeline

**Automated Flow:**
1. Push to `main` branch
2. Cloud Build triggers automatically
3. Docker image built and pushed
4. Deployed to Cloud Run with zero downtime
5. Environment variables configured

**Build Settings:**
- **Runtime**: Node.js 20
- **Memory**: 512Mi
- **CPU**: 1
- **Min instances**: 0 (serverless)
- **Max instances**: 10 (auto-scaling)
- **Timeout**: 300s
- **Region**: us-central1

## 🌐 Access Your App

After deployment:
```
https://nihongo-sprinter-xxxxx-uc.a.run.app
```

## 🔧 Configuration Details

**Cloud Run Features:**
- ✅ Serverless scaling (0 to 10 instances)
- ✅ HTTP/3 support
- ✅ Custom domains
- ✅ Environment variables
- ✅ Health checks
- ✅ Traffic splitting
- ✅ Revision management

**Build Optimization:**
- ✅ Layer caching
- ✅ Parallel builds
- ✅ Artifact Registry
- ✅ Cloud logging
- ✅ Build notifications

## 🔍 Troubleshooting

**Build Issues:**
```bash
# Check build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

**Deployment Issues:**
```bash
# Check service logs
gcloud run services logs read nihongo-sprinter --region us-central1

# Check service configuration
gcloud run services describe nihongo-sprinter --region us-central1
```

**Permission Issues:**
```bash
# Set up IAM roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"
```

## 🎯 Next Steps

1. **Set up Cloud Build trigger** in Google Cloud Console
2. **Test deployment** by pushing changes to main branch
3. **Configure custom domain** (optional)
4. **Set up monitoring** and alerts
5. **Configure CDN** for global performance

Your app is now ready for automated deployment! 🎉