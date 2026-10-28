# 更新

```sh
docker compose pull
docker compose up -d
```

更新并重建容器不会丢失任何数据：客户端登录态（`qq_profile`）与已安装的客户端程序（`qq_install`）保存在命名卷中，`./data`、`./workspace` 和 `./logs` 则是宿主机绑定挂载目录，升级后原样保留。

## 固定镜像版本

`.env` 中的 `PERSONAL_BOT_TAG` 留空时，`docker compose pull` 默认拉取 `latest`（最新发布版）。若将其设为具体版本标签（例如 `v2026.1025.0`），则会锁定在该版本，后续 `pull` 只会拉取同一标签下的重构建镜像。切换版本只需修改 `PERSONAL_BOT_TAG` 并重新执行 `docker compose up -d`。

## 当新版本更换了固定的 QQ 客户端版本时

`qq` 镜像内置了所要求 QQ 安装包的 SHA-256 摘要。首次安装完成后，容器会在 `qq_install` 卷中写入安装标记；此后启动只要检测到该标记，就会直接跳过安装且不再重新比对版本。因此，**如果新发布的镜像升级了所固定的 QQ 客户端版本，升级时需要先删除 `qq_install` 卷再启动**：

```sh
docker compose down
docker volume ls | grep qq_install   # 找到以 qq_install 结尾的卷名（带项目名前缀）
docker volume rm <上面查到的卷名>
docker compose up -d
```

请勿删除客户端配置卷（`qq_profile`）：其中保存着登录态和本地加密数据库，删除后需要重新扫码登录。

## 升级后检查

- 打开管理面板的[概览](./console/)页面，查看顶部是否出现 **待处理** 卡片：若存在未设置管理员、未选主模型、Jev 未配置 key 或技能源更新失败等问题，每项右侧都会提供一键跳转或处理按钮。
- 数据库密钥保存在 `data/driver/secrets/db_key` 中，常规升级无需重新提取。
