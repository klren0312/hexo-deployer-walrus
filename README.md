# hexo-deployer-walrus
Walrus deployer plugin for Hexo

## Installation

``` bash
$ npm install hexo-deployer-walrus --save
```

## Options
You can configure this plugin in `_config.yml`. How to setting walrus site-builder can be found in the Walrus official [Documentation](https://docs.wal.app/walrus-sites/intro.html/)

``` yaml
deploy:
  type: walrus (allow)
  network: mainnet or testnet (allow)
  epochs:  number of epochs to store file for walrus (allow, max is 53)
  site_builder_path: default use the system environment variable, you can use custom path
  sites_config_path: default use the plugin config, you can use custom path
```

## License
DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE