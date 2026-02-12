if (-not (Test-Path ".git")) {
    git init
    git branch -M main
    git remote add origin https://github.com/HugoMolin15/Echo.git
}

git add .
git commit -m "Update site from local changes"
git push -u origin main
