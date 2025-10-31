# Quick deployment status checker
Write-Host "🔍 Checking Azure Static Web App deployment status..." -ForegroundColor Cyan

# Check deployment status
$status = az staticwebapp environment list --name "mileage-claims-app" --resource-group "rg-mileage-claims" --query "[0].status" -o tsv

Write-Host "Current Status: $status" -ForegroundColor Yellow

switch ($status) {
    "Ready" { 
        Write-Host "✅ Deployment is complete! App should be available." -ForegroundColor Green
        Write-Host "🌐 Visit: https://icy-moss-0a168e003.3.azurestaticapps.net" -ForegroundColor Blue
    }
    "WaitingForDeployment" { 
        Write-Host "⏳ Still deploying... please wait 1-2 minutes and check again." -ForegroundColor Yellow 
    }
    "Failed" { 
        Write-Host "❌ Deployment failed. Check Azure portal for details." -ForegroundColor Red 
    }
    default { 
        Write-Host "🤔 Unknown status: $status" -ForegroundColor Magenta 
    }
}

Write-Host "`n💡 Run this script again with: .\check-deployment.ps1" -ForegroundColor Gray