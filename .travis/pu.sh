#!/bin/sh

setup_git() {
    echo "Setting up git"
  # Set the user name and email to match the API token holder
  # This will make sure the git commits will have the correct photo
  # and the user gets the credit for a checkin
  git config --global user.email "donrriddo@gmail.com"
    echo "Set up git email"
  git config --global user.name "donriddo"
    echo "Set up git username"
  git config --global push.default matching
    echo "Set up git push default"
  
  # Get the credentials from a file
  git config credential.helper "store --file=.git/credentials"
    echo "Set up git credentials helper"
  
  # This associates the API Key with the account
  echo "https://${GITHUB_API_KEY}:@github.com" > .git/credentials
    echo "Set up git api_key"

}

make_version() {
    echo "Making version"
  # Make sure that the workspace is clean
  # It could be "dirty" if
  # 1. package-lock.json is not aligned with package.json
  # 2. npm install is run
  git checkout -- .
  
  # Echo the status to the log so that we can see it is OK
  git status
  
  # Run the deploy build and increment the package versions
  # %s is the placeholder for the created tag
  npm version patch -m "nfshare: release version %s [skip ci]"
}

upload_files() {
  # This make sure the current work area is pushed to the tip of the current branch
  git push origin HEAD:$TRAVIS_BRANCH
  
  # This pushes the new tag
  git push --tags
}

deploy_package() {
    npm adduser <<!
    donriddo
    $NPM_PASSWORD
    donriddo@gmail.com
!
    npm publish
}

setup_git
make_version
upload_files
deploy_package