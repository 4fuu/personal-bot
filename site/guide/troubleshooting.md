# 排障

| 现象 | 含义与处理 |
| --- | --- |
| `error: no QQ source: set exactly one of ...` | `QQ_DEB_URL` 和挂载的 deb 都没给，见 [首次启动](./first-start) |
| `error: sha256 mismatch: expected ... got ...` | 这个 deb 不是固定版本，换一个文件 |
| `error: both QQ_DEB_URL and the mounted deb ... are set` | 去掉其中一个 |
| 实时画面一直停在二维码 | 这是正常的：扫码登录是手动的，由你完成 |
| `db.key = "missing"` | 密钥提取还没完成。日志在宿主机的 `./logs/keyx.log`（容器内 `/out/keyx.log`）。驱动程序会继续等，密钥就绪后状态自己变成 `"ok"` |
| `db.key = "invalid"` | 客户端换过密钥，或私有副本对不上。按面板 QQ 页上给的步骤重新提取 |
| 面板页面返回 502 | driver 或 bot 还没起来，看 `docker compose logs qq bot` |
| 机器人一轮都不开始 | 先看 概览 的 待处理：至少一个管理员、允许列表里至少一个会话，两者齐备才开轮 |
| 一条消息都发不出去 | Jev 不可达时出口审查失败关闭。去 [模型](./console/models) 看它的状态、补 key |
| 沙箱里装不了技能、连不上源 | 目标域名不在放行名单里。去 [安全](./console/safety) 的 网络 看名单，删掉误拦的条目让它重新判定 |
| 改了人设没变化 | 人设在下一个窗口生效，或用页面上的 立即轮换 |

## 日志在哪

- 面板的 [日志](./console/logs) 页：驱动、机器人和面板自己的事件，可筛选、实时。
- 宿主机的 `./logs/`：`qq` 容器自己的诊断日志，**可能包含聊天内容**，不要分享。

## 还不行

带上这些信息再提问：镜像 tag（`PERSONAL_BOT_TAG` 或 `latest`）、
`docker compose ps` 的输出、`./logs/qq.log` 和 `./logs/keyx.log` 的尾部
（聊天内容先删掉），以及面板 [概览](./console/) 的截图（mock 数据也可以）。
