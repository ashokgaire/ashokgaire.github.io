---
title: "Insecure Deserialization with Python Pickle module"
date: 2021-05-20 10:50:00 +0530
categories: [Python,Deserialization]
tags: [pickle, python deserialization, pickling]
image: /images/python/pickle.jpg
---
> This is one of those findings which is very difficult to identify during security testing. The best chance we have is while doing Source Code Review of the vulnerable code base. Thus, today will we look from the source code perspective, how a vulnerable code looks and how to flag this.

This certainly is one of those critical bugs that you don’t wish to have in your system. This is the reason why it has earned its place in the current [**OWASP TOP 10**](https://owasp.org/www-project-top-ten/2017/A8_2017-Insecure_Deserialization.html) findings. Below are some to the attacks that can be performed if `Insecure Deserialization` is present.

-`RCE (Remote Code Execution)` : This is by far the most popular and undoubtedly, a serious vulnerabiltiy.
-`Data Extraction` : HTTP cookies, HTML form parameters, API authentication tokens.
-`DoS (Denial of Service) attack`.

> let first understand what is `Serialization`, `Deserialization` and their use in real world.

-`Serialization` : Serialization is a mechanism of converting the state of an object into a byte stream, JSON, YAML, XML. JSON and XML are two of the most commonly used serialization formats within web applications.
-`Deserialization` : It is the reverse process where the byte stream is used to recreate the actual object in memory.

We serialize the data for the purpose of storing it into the memory(hard disk) or sending the data over a network.

As the name of the vulnerability suggests, this vulnerability arises when the we deserialize the data that might be coming from a malicious source.
Python’s native module for `serialization` and `deserialization` data is called pickle. The process of serialization and deserialization is called `pickling` and `unpickling` respectively.


Let’s see a vulnerable code  and try to understand it.


```bash
import pickle
import os

#1. creating a  class which has our malicious payload command (‘whoami’)
class Pickle(object):
    def __reduce__(self):
        return (os.system, ('whoami', ))

#2. serializing the malicious class
pickle_data = pickle.dumps(Pickle())
#storing the serialized output into a file in current directory
with open("backup.data", “wb”) as file:
    file.write(pickle_data)

#reading the malicious serialized data and de-serializing it
with open(“backup.data”, “rb”) as file:
     pickle_data = file.read()
     my_data = pickle.loads(pickle_data)
```

unpkling the above malicious object results  code execution. 
```bash
(base) ┌─[✗]─[oxy@parrot]─[~/home]
└──╼ $python3 test.py 
oxy
```


How to identify this while doing Source code Review/ Analysis ?
There are certain automated tools which might flag this “pickle.loads” method but you will have to track back the input source of the serialized data.
While doing this manually, we can follow a step by step approach as mentioned below :
-look at the import section on top to establish, if pickle module is being used or not.
-look for the “pickle.loads” method use, whether it is called on an input parameter or not.
-Track to the source to see if the input source is user controlled and can possibly be tainted.



Is there any alternative for picking?
-Yes. There is  JSON seialization/deserialization  which came with json module.

I prefer JSON over pickle for my serialization. Unpickling can run arbitrary code, and using pickle to transfer data between programs or store data between sessions is a security hole. JSON does not introduce a security hole and is standardized, so the data can be accessed by programs in different languages if you ever need to.


Thanks for reading hope that you enjoyed.
