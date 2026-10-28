# Disclaimer

Read this document in full before running anything from this repository.

## No affiliation with Tencent

`personal-bot` is an independent, third-party interoperability project. It has
**no affiliation, partnership, authorization, or endorsement relationship with
Tencent or QQ**, and it is not an official Tencent product. "QQ", "Tencent",
and related trademarks belong to their respective owners. Nothing in this
project is provided, reviewed, or approved by Tencent.

## What the software actually does

The stack runs the **official, unmodified QQ NT desktop client for Linux** on a
virtual display inside a container. It interacts with that client in three
specific ways:

- **Database reading:** It copies the client's local SQLCipher database files
  and decrypts that **private copy** (using a database key extracted once at
  first login under `gdb`) to read messages, display names, and group
  membership. The decrypted copy stays on your machine.
- **Sending and per-message media download:** It preloads a small library into
  the client at launch (`LD_PRELOAD`) that calls the client's own send function,
  reads its built-in face table, and asks the client to download the image or
  file attachment for a specific message when the assistant reads it. No client
  file on disk is ever patched, replaced, or modified.
- **Session resume click:** When the client returns to its account screen after
  a restart, the driver clicks the **登录** button over the Linux accessibility
  bus (`AT-SPI`) so a saved session resumes automatically. Initial QR-code
  sign-in remains manual.

The stack does not subscribe to the client's incoming event stream and does not
use any third-party protocol reimplementation. Outbound network traffic from the
stack goes only to the model providers you configure (plus the `pi.dev` model
catalog unless `PI_OFFLINE=1`), [Jev](https://typesafe.ai/) for outbound review
and gating (with stored secrets scrubbed beforehand), the web-search provider
you configure, the MCP servers you connect, and the domains allowed through the
sandbox's egress proxy.

## You assume all account and data risk

Driving a desktop chat client through automation violates that client's terms
of service. Any account used with this project may be **restricted, suspended,
or permanently banned**, and its local chat history may be lost. You take on
that risk voluntarily and in full.

To reduce the likelihood of account restrictions:

- Use a secondary account with established history rather than a newly
  registered account.
- Run the stack on a residential network connection rather than a datacenter IP.
- Keep the default send pacing and do not increase the message rate limits.
- Keep the pinned client build and do not allow the client to self-update.

## Provided "as is" without warranty

This software is provided **as is** and **as available**, without warranty of
any kind, express or implied, including but not limited to warranties of
merchantability, fitness for a particular purpose, non-infringement,
availability, accuracy, or uninterrupted operation. To the maximum extent
permitted by applicable law, the authors and copyright holders shall not be
liable for any direct, indirect, incidental, special, punitive, or
consequential damages—including account restriction or loss, data loss, loss of
profits or business, or service interruption—arising out of the use of, or
inability to use, this project.

## Lawful use only

You must not use this project for any unlawful or abusive purpose, including
spam, harassment, fraud, unauthorized access to any computer system or network,
or the distribution of unlawful or malicious content. You are solely
responsible for ensuring that your deployment and use comply with all
applicable laws and platform terms.
