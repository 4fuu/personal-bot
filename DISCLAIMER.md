# Disclaimer

Read this before you run anything from this repository.

## Not affiliated with Tencent

personal-bot is an independent, third-party interoperability project. It has **no
affiliation, partnership, authorisation or endorsement relationship with Tencent
or with QQ**, and it is not an official Tencent product. "QQ", "Tencent" and
related marks belong to their respective owners. Nothing here is provided,
reviewed or approved by Tencent.

## What it does, plainly

The stack runs the **official, unmodified QQ NT desktop client for Linux** inside
a container, on a virtual display. It does three things with that client:

- it reads messages out of a **private, decrypted copy** of the client's own
  local database, which never leaves your machine;
- it sends messages by calling the client's **own send function** through a small
  library the container preloads into the client at launch - no file of the
  client is patched, replaced or written to;
- it clicks the client's own 登录 button over the accessibility bus when the
  client returns to its account page, so a saved session resumes on its own. A
  QR login stays manual, and it is yours to do.

It reads nothing else. It does not read your contacts beyond the names the
client itself shows, it does not listen to any event stream of the client, and it
sends nothing anywhere except the model provider you configure and the MCP
servers you connect.

## The risk is yours

Automating a chat client is outside that client's terms of service. The account
you run this with can be **restricted, suspended or permanently lost**, and your
local message history can be lost with it. That risk is yours, and you take it on
voluntarily.

To keep it as small as it can be:

- use a secondary account that already has some history, not a fresh one;
- run on a residential connection, not a datacenter IP;
- keep the default send pacing, and do not raise it;
- keep the client's own version, and do not let it update itself.

## Provided as is

This project is provided **as is** and **as available**, without warranty of any
kind, express or implied, including merchantability, fitness for a particular
purpose, non-infringement, availability, accuracy or uninterrupted operation. To
the maximum extent permitted by law, the authors and copyright holders are not
liable for any direct, indirect, incidental, special, punitive or consequential
damage - including account restriction or loss, data loss, lost profits or
business, or service interruption - arising from the use of, or the inability to
use, this project.

## No unlawful use

You may not use this project for any unlawful purpose, including spam,
harassment, fraud, unauthorised access to any system or network, or the
distribution of malicious content. You are responsible for making sure your use
complies with the laws that apply to you and with the terms of every platform you
connect it to.
