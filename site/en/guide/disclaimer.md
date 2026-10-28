# Disclaimer

The authoritative text is
[DISCLAIMER.md](https://github.com/4fuu/personal-bot/blob/main/DISCLAIMER.md)
in the repository root; this page summarizes its key terms. Read the full file
before running anything.

## No affiliation with Tencent

`personal-bot` is an independent, third-party interoperability project. It has
**no affiliation, partnership, authorization, or endorsement relationship with
Tencent or QQ**, and it is not an official Tencent product. "QQ", "Tencent",
and related trademarks belong to their respective owners. Nothing here is
provided, reviewed, or approved by Tencent.

## What the software actually does

The stack runs the **official, unmodified QQ NT desktop client for Linux** on a
virtual display inside a container and interacts with it in three specific
ways:

- **Database reading:** It copies the client's local database files and reads
  that **private copy** (with a database key extracted once at first login) to
  get messages, display names, and group membership. The copy never leaves
  your machine.
- **Sending and per-message media download:** It loads a small library into
  the client at launch that calls the client's own send path and asks the
  client to download the image or file attachment for a specific message when
  the assistant reads it. No client file on disk is ever patched, replaced, or
  modified.
- **Session resume click:** When the client returns to its saved-account screen
  after a restart, the driver clicks the **登录** button once so a saved session
  resumes automatically. Initial QR-code sign-in remains manual.

The stack does not subscribe to the client's incoming event stream and does not
use any third-party protocol reimplementation. Outbound network traffic goes
only to the model providers you configure (plus the `pi.dev` model catalog
unless `PI_OFFLINE=1`), [Jev](https://typesafe.ai/) for outbound review and
gating (with stored secrets scrubbed beforehand), the web-search provider you
configure, the MCP servers you connect, and the domains allowed through the
sandbox's egress proxy.

## You assume all risk

Driving a desktop chat client through automation violates that client's terms
of service. Any account used with this project can be **restricted, suspended,
or permanently banned**, and its local chat history can be lost. You take on
that risk voluntarily and in full.

To keep account risk as low as possible:

- Use a secondary account with established history rather than a newly
  registered account.
- Run on a residential network connection rather than a datacenter IP.
- Keep the default send pacing and do not raise the message rate limits.
- Keep the pinned client build and do not allow the client to self-update.

## Provided "as is"

This project is provided **as is** and **as available**, without warranty of
any kind, express or implied, including warranties of merchantability, fitness
for a particular purpose, non-infringement, availability, accuracy, or
uninterrupted operation. To the maximum extent permitted by law, the authors
and copyright holders are not liable for any direct, indirect, incidental,
special, punitive, or consequential damages—including account restriction or
loss, data loss, lost profits or business, or service interruption—arising from
the use of, or inability to use, this project.

## Lawful use only

You must not use this project for any unlawful or abusive purpose, including
spam, harassment, fraud, unauthorized access to any system or network, or the
distribution of malicious content. You are responsible for ensuring that your
use complies with all applicable laws and with the terms of every platform you
connect.
