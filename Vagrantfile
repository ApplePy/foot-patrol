# -*- mode: ruby -*-
# vi: set ft=ruby :

module OS
  def OS.windows?
      (/cygwin|mswin|mingw|bccwin|wince|emx/ =~ RUBY_PLATFORM) != nil
  end

  def OS.mac?
      (/darwin/ =~ RUBY_PLATFORM) != nil
  end

  def OS.unix?
      !OS.windows?
  end

  def OS.linux?
      OS.unix? and not OS.mac?
  end
end

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://vagrantcloud.com/search.
  config.vm.box = "applepy/high-sierra-dev"

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # NOTE: This will enable public access to the opened port
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine and only allow access
  # via 127.0.0.1 to disable public access
  # config.vm.network "forwarded_port", guest: 80, host: 8080, host_ip: "127.0.0.1"

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"
  config.vm.synced_folder ".", "/vagrant", disabled: true

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  config.vm.provider "virtualbox" do |vb|
    # Display the VirtualBox GUI when booting the machine
    # vb.gui = true

    # Set EFI parameters if not on a Mac
    if ! OS.mac?
      # VBoxManage.exe modifyvm "High Sierra" --cpuidset 00000001 000306a9 04100800 7fbae3ff bfebfbff
      vb.customize ["modifyvm", :id, "--cpuidset", "00000001", "000306a9", "04100800", "7fbae3ff", "bfebfbff"]
      # VBoxManage setextradata "High Sierra" "VBoxInternal/Devices/efi/0/Config/DmiSystemProduct" "MacBookPro11,3"
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/efi/0/Config/DmiSystemProduct", "MacBookPro11,3"]
      # VBoxManage setextradata "High Sierra" "VBoxInternal/Devices/efi/0/Config/DmiSystemVersion" "1.0"
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/efi/0/Config/DmiSystemVersion", "1.0"]
      # VBoxManage setextradata "High Sierra" "VBoxInternal/Devices/efi/0/Config/DmiBoardProduct" "Mac-2BD1B31983FE1663"
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/efi/0/Config/DmiBoardProduct", "Mac-2BD1B31983FE1663"]
      # VBoxManage setextradata "High Sierra" "VBoxInternal/Devices/smc/0/Config/DeviceKey" "ourhardworkbythesewordsguardedpleasedontsteal(c)AppleComputerInc"
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/smc/0/Config/DeviceKey", "ourhardworkbythesewordsguardedpleasedontsteal(c)AppleComputerInc"]
      # VBoxManage setextradata "High Sierra" "VBoxInternal/Devices/smc/0/Config/GetKeyFromRealSMC" 1
      vb.customize ["setextradata", :id, "VBoxInternal/Devices/smc/0/Config/GetKeyFromRealSMC", "1"]
    end

    # Get CPU and RAM count
    if OS.windows?
      cpu_count = [ `wmic cpu get NumberOfCores`.split("\n")[2].to_i, 4 ].min
      memory_count = [ `wmic OS get TotalVisibleMemorySize`.split("\n")[2].to_i / 1024 / 2, 4096 ].min
    elsif OS.unix?
      # Won't get bit by scope, Ruby acts like Python
      cpu_count = [ `sysctl -n hw.ncpu`.to_i, 4 ].min
      memory_count = [`sysctl -n hw.memsize`.to_i / 1024**2 / 2, 4096 ].min
    end

    vb.name = "high-sierra-dev"

    vb.cpus = cpu_count
    vb.memory = memory_count
  end
  #
  # View the documentation for the provider you are using for more
  # information on available options.

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell", privileged: true, inline: <<-SHELL
    gem install xcpretty
  SHELL
  config.vm.provision "shell", privileged: false, inline: <<-SHELL
    brew tap caskroom/versions
    brew upgrade
    brew install gitlab-runner
    brew cask install visual-studio xamarin-ios xamarin-android java8 android-sdk

    # Setup Android development tools
    mkdir -p ~/.android && touch ~/.android/repositories.cfg
    yes | sdkmanager --licenses
    sdkmanager "build-tools;26.0.3"
    sdkmanager "platforms;android-26"
    sdkmanager "patcher;v4"
    sdkmanager "platform-tools"
    sdkmanager --update
  SHELL
end
