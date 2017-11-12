# node-file-share
A Node.js command line tool to serve files and share on a local network.

# To install
`npm install -g node-file-share`

# To start serving and sharing files on your network

`nfshare <root-folder-to-share>`

# Default PORT is :1994, To specify another port

`nfshare <root-folder-to-share> -p <PORT>`

# Example

`nfshare /Volumes/Donriddo -p 9000`

```####################################################
File Server Launched at your localhost:9000

You can start sharing on your network with IP Address: 192.168.43.217:9000

####################################################
File Server Root Folder:  /Volumes/Donriddo
```

# You can see how with the HELP command

`nfshare --help`


