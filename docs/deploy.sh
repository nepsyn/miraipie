#!/usr/bin/env sh

# throw errors
set -e

# cd
cd .vuepress/dist

# git
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:nepsyn/miraipie.git master:gh-pages

cd -
