# Makerflow

Makerflow is a deep work  and collaboration assistant for developers. Get in the zone without 
hiding away from your product manager, designer or other developers on the team!

## Features

1. Easily toggle "do-not-disturb" mode on macOS.
1. Update your Slack status quickly to let your co-workers know when 
   1. you are trying to do deep work
   1. or, when you are on a break.
1. Get a quick list of your 
   1. Slack notifications
   1. pull requests from GitHub or Bitbucket
    1. upcoming events from Google calendar

### Pre-requisites

You will need a free Makerflow account and API token to get started. Sign up or login at https://makerflow.co

You can get a new token from https://app.makerflow.co/settings#api

### Installation

To install, run `npm install -g makerflow`

Once installed, run `makerflow config token` to set your API token.

### Usage

Get a list of available commands with `makerflow help`

#### Flow Mode

Flow Mode turns on "do-not-disturb" mode on macOS to block your notifications and 
prevent distractions. If you have your Slack workspace connected to Makerflow, turning on 
"Flow Mode" will automatically set your Slack status to let your teammates know you might be
slow to respond

To start Flow Mode, run `makerflow start` and to end it, run `makerflow stop`

#### List pending tasks

`makerflow tasks todo` will list  notifications from Slack and pull requests from GitHub or Bitbucket

#### Breaks

Breaks are a quick way to set your Slack status and let your coworkers know when you are 
away on a break.

To go on a break, run `makerflow break start` and to end it, run `makerflow break stop`.

##### Reason for taking a break

If you pass a `reason`, Makerflow will automatically set an appropriate status and emoji 
for you on Slack. For instance, if you run `makerflow break start --reason=lunch`, it will set 🥪 
emoji as your status icon. If you don't supply a reason, your status will be set to ⏸.

Reasons currently supported are coffee (☕️), tea (🍵), beverage (🥤), and lunch (🥪).

#### Events (from Google Calendar)

`makerflow events list` will list recently ended, ongoing and upcoming events from Google Calendar.

## Upcoming

Makerflow VScode plugin is coming soon to trigger "Flow Mode" automatically, so you can get more done
in less time!

A Chrome/Firefox extension is also in the works to automatically block distracting websites when you
are in Flow Mode.
