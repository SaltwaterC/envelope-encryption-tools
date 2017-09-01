## About

Subproject of envelope-encryption-tools to test the interoperability with AWS SDK for Java. The integration tests only the Envelope V2 scheme. It provides reads / writes on both sides.

## How to use

The AWS credentials need to be supplied as environment variables. `EET_BUCKET` is also an environment variable which points the integration suite to the bucket where the writes / reads take place. The build tool is `jake` which needs to be installed with `npm -g install jake`. Maven and JDK installations need to be available as well which are left as exercise for the reader.

Everything is chained into the default jake task. In a nutshell:

```bash
AWS_ACCESS_KEY_ID=key_id AWS_SECRET_ACCESS_KEY=secret_key EET_BUCKET=bucket-name jake
```

## Troubleshoot

```
java.lang.reflect.InvocationTargetException
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.lang.reflect.Method.invoke(Method.java:498)
	at org.codehaus.mojo.exec.ExecJavaMojo$1.run(ExecJavaMojo.java:297)
	at java.lang.Thread.run(Thread.java:748)
Caused by: com.amazonaws.SdkClientException: Unable to build cipher: Illegal key size
Make sure you have the JCE unlimited strength policy files installed and configured for your JVM
```

Most probably, this exception would be thrown, unless the JCE unlimited strength policy is installed beforehand. Oracle provides the [jce_policy-8.zip](http://www.oracle.com/technetwork/java/javase/downloads/jce8-download-2133166.html) archive for download.

The README is pretty helpful, unless you're running macOS / OS X. A one liner solution:

```bash
Downloads/UnlimitedJCEPolicyJDK8 » sudo cp *.jar /Library/Java/JavaVirtualMachines/jdk$(java -version 2>&1 | grep version | cut -d '"' -f 2).jdk/Contents/Home/jre/lib/security
```
