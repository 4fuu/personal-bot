# 更新

```sh
docker compose pull
docker compose up -d
```

数据不会丢。客户端配置和它的安装都是卷，重建容器不损失任何东西；
`./data`、`./workspace`、`./logs` 都是绑定挂载，原样留着。

## 固定版本

`PERSONAL_BOT_TAG` 留空时拉 `latest`（最新发布）；设为某个 tag（例如 `v2026.1025.0`）
就固定在那一个版本上，`docker compose pull` 只会拉到同 tag 的新构建。
换版本就是改这一个值，再 `up -d`。

## 换了固定的 QQ 版本时

镜像内置了它安装的 QQ 版本的 sha256，安装结果连同一个标记落在 `qq_install` 卷里，
有这个标记就跳过安装、也不重新校验。所以**如果新发布换了固定的 QQ 版本，
要先删掉这个卷再启动**，否则旧的会被继续用：

```sh
docker compose down
docker volume ls | grep qq_install   # 名字以 qq_install 结尾的那个，前面带项目名前缀
docker volume rm <上面列出的名字>
docker compose up -d
```

客户端配置（`qq_profile`）不要删：那里面是登录态和本地消息历史，删了要重新扫码。

## 升级之后

- 打开 [概览](./console/) 看一眼 待处理：没有管理员、没有主模型、Jev 没有 key
  这类问题会列在那里，每项带一个修复按钮。
- 数据库密钥一般不用管：它存在 `data/driver/secrets/db_key`，重启依然有效。
