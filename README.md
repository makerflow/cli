# Makerflow 💻 🌊

Makerflow is a deep work  and collaboration assistant for developers. Get in the zone without 
hiding away from your product manager, designer or other developers on the team!

## `npm install -g makerflow-cli`

## Features

1. 🔕 Easily toggle "do-not-disturb" mode on macOS.
1. 🙅 Close distracting apps like Slack, Discord, and WhatsApp (h/t [@VicVijayakumar](https://twitter.com/VicVijayakumar/status/1425590056266436610))
1. 💬 Update your Slack status quickly to let your co-workers know when 
   1. you are trying to do deep work 💻
   1. or, when you are on a break. ☕️ 🍵 🥪 🥤 🚶 🏃 💪 🏥 👶 ⏸
1. 📋 Get a quick list of your 
   1. Slack notifications
   1. pull requests from GitHub or Bitbucket
1. ✅ and mark them as done
1. 📅 See all your ongoing and upcoming events from Google Calendar

## Pre-requisites

1. MacOS. 
1. A free Makerflow account. Sign up at https://makerflow.co
1. API token from https://app.makerflow.co/settings#api

## Installation

To install, run `npm install -g makerflow-cli`

Once installed, run
1. `makerflow config token` to set your API token.
2. `makerflow config kill` to set which apps are automatically closed when Flow Mode is started and reopened 
when it is ended

## Usage

Get a list of available commands with `makerflow help`

### Flow Mode

Starting Flow Mode will: 
1. 🔕 Turn on "do-not-disturb" mode on macOS to block your notifications and 
   prevent distractions.
1. 💬 If you have your Slack workspace connected to Makerflow, it will automatically set your 
   Slack status to let your teammates know you might be slow to respond.
1. 🙅 Close distracting apps like Slack, Discord, and WhatsApp, if you
   1. Once if you ran `makerflow start --kill` or `makerflow toggle --kill`
   1. Everytime if you configured it to do so with `makerflow config kill`

To end Flow Mode, run `makerflow stop`. This will reverse all the actions that took place 
when you started Flow Mode.

#### Commands
`makerflow toggle` - start or end Flow Mode

`makerflow start` - start Flow Mode

`makerflow stop` - stop Flow Mode

### Tasks

Tasks show up in Makerflow by connecting with your other collaboration tools like Slack, GitHub or Bitbucket.

You can connect your accounts from 

`makerflow tasks todo` - list  notifications from Slack and pull requests from GitHub or Bitbucket.

`makerflow tasks done` - list notifications/pull requests and mark one or more tasks as done

#### Breaks

Breaks are a quick way to set your Slack status and let your coworkers know when you are 
away on a break.

To go on a break, run `makerflow break start` and to end it, run `makerflow break stop`.

##### Reason for taking a break

If you pass a `--reason` argument, Makerflow will automatically set an appropriate status and emoji 
for you on Slack. For instance, if you run `makerflow break start --reason=lunch`, it will set 🥪 
emoji as your status icon. If you don't supply a reason, your status will be set to ⏸.

Reasons currently supported are lunch (🥪), coffee (☕️), tea (🍵), beverage (🥤), walk (👟), run (🏃), workout (💪), 
child (👶), and doctor (🏥).

#### Events (from Google Calendar)

`makerflow events list` will list recently ended, ongoing and upcoming events from Google Calendar.

## Upcoming

Makerflow VScode plugin is coming soon to trigger "Flow Mode" automatically, so you can get more done
in less time!

A Chrome/Firefox extension is also in the works to automatically block distracting websites when you
are in Flow Mode.
