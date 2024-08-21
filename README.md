# ReminiBridge

- 这是个针对Remini的基于Ulixee Hero的爬虫程序,     
主要优点是隐形, 模拟人类, 可以登录谷歌等普通爬虫难以登录的服务.    

- 目前我只写了登录部分的测试代码, 其它什么都没写.     
***注意仅作参考.***   这只是个雏形, 账号啥的都直接定义在代码里的😂.    
谷歌账号首次登录remini请自己在浏览器登录一下给第一次授权, 之后就不需了.    
Ulixee hero是支持多实例的, 所以可以基于它来开发并发的能力.    

- Ulixee官方文档 https://ulixee.org/docs/hero

- 项目分两个部分, node_service部分是核心程序,     
next_service部分只是个界面(只有一个按钮😂),    
但因为写了跟核心交互的内容所以还是贴出来以供参考,    

### 安装
首先不管什么系统, 需要npm, 我用的`10.8.2`

#### 核心部分
这部分安装会有@substrate/connect@0.8.8不再获得支持的警告, 无视就可以了.  
```shell
cd ./node_service
npm install
```
#### UI部分
```bash
cd ./next_service
npm install
```


### 运行

#### 核心部分
***需要开两个node进程***    
- 首先是ulixee cloud,这是ulixee hero调用的服务, 需要运行起来, 默认是本地1818,    
```bash
cd ./node_service
npx @ulixee/cloud start
```
- 然后才是我们自己的服务, 这是运行在4000端口的本地服务, 这个需要调上面的cloud来工作
```bash
cd ./node_service
npm start
```

#### UI部分 
这是next服务, 网页运行在本地3000端口
```bash
cd ./next_service
npm run dev
```