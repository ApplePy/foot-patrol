#! /bin/bash

# Insist stop on error
set -e

# Help message function
print_help () {
  echo "install-runner-virtualbox.sh  *CI_TOKEN* | --uninstall | --help"
  echo ""
  echo "*CI_TOKEN*       Gitlab runner CI token"
  echo ""
  echo "Flags:"
  echo "-h | --help      Print help"
  echo "--uninstall      Uninstall gitlab-runner and associated virtual machine"
}

# Start without root
if [ $UID -eq 0 ]; then
  echo "Script must not be started as root." >&2
  exit 1
fi

# Ensure homebrew is installed
if ! command -v brew > /dev/null ; then
  echo "Homebrew must be installed." >&2
  exit 2
fi

# Ensure CI token was passed
if [ $# -ne 1 ] ; then
  echo "Gitlab CI token or '--uninstall' must be passed as an argument." >&2
  print_help
  exit 2
fi


#### ---- FUNCTIONS ---- ####

install () {
  CI_TOKEN=$1

  # Retrieve user password for later
  echo -n "Please enter your password (make sure to type it right the first time!): "
  read -s PASSWORD
  echo

  # Download tools
  brew update
  brew install gitlab-runner
  echo $PASSWORD | sudo -kS chown root: $(which gitlab-runner)
  brew cask fetch virtualbox virtualbox-extension-pack vagrant

  # Install tools, messing with sudo so it doesn't ask for password
  echo $PASSWORD | sudo -kS echo; brew cask install virtualbox 
  echo $PASSWORD | sudo -kS echo; brew cask install virtualbox-extension-pack
  echo $PASSWORD | sudo -kS echo; brew cask install vagrant

  # Setup VM
  vagrant up

  # Install Xcode helpers
  echo $PASSWORD | sudo -kS gem install xcpretty

  # Setup gitlab-runner
  echo $PASSWORD | sudo -kS cp .vagrant/machines/default/virtualbox/private_key ~root/.gitlab-runner-private-key
  echo $PASSWORD | sudo -kS gitlab-runner register --non-interactive -r $CI_TOKEN --tag-list mac,xamarin -u https://incode.ca/ --executor virtualbox --virtualbox-base-name high-sierra-dev --ssh-user vagrant --ssh-identity-file ~root/.gitlab-runner-private-key
  echo $PASSWORD | sudo -kS gitlab-runner install -u root -d ~root
  echo $PASSWORD | sudo -S sed '/^$/N;/^\n$/i\
<key>EnvironmentVariables</key><dict><key>HOME</key><string>/var/root</string></dict>' /Library/LaunchDaemons/gitlab-runner.plist | sudo sh -c "cat > /Library/LaunchDaemons/gitlab-runner.plist"
  echo $PASSWORD | sudo -kS gitlab-runner start

  # Shutdown VM
  vagrant halt
}

uninstall () {

  # Safety check
  read -r -p "Are you sure? [y/N] " response
  case "$response" in
      [yY][eE][sS]|[yY]) 
          echo "Starting uninstall..."
          ;;
      *)
          echo "Exiting without uninstalling..."
          exit 1
          ;;
  esac

  # Retrieve user password for later
  echo -n "Please enter your password (make sure to type it right the first time!): "
  read -s PASSWORD
  echo

  # Stop gitlab-runner
  brew services stop gitlab-runner
  echo $PASSWORD | sudo -kS gitlab-runner unregister -u https://incode.ca/ --all-runners
  echo $PASSWORD | sudo -kS rm ~root/.gitlab-runner-private-key

  # Shutdown VM
  vagrant destroy -f

  # Uninstall runner
  echo $PASSWORD | sudo -kS gitlab-runner stop
  echo $PASSWORD | sudo -kS gitlab-runner uninstall

  # Output warning
  tput setaf 3; echo "INFO: Preserving Vagrant and Virtualbox. To uninstall, run 'brew cask uninstall vagrant virtualbox'"
  tput sgr0
}


#### ------ MAIN PROGRAM ------ ####

# Output a help
if [ $1 == "-h" ] || [ $1 == "--help" ]; then
  print_help
elif [ $1 == "--uninstall" ]; then
  uninstall $@
else
  install $@
fi

exit 0
