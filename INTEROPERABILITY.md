Brain dump:

```shell
openssl pkcs8 -topk8 -inform PEM -outform DER -in private.pem -out private.der -nocrypt
openssl rsa -in private.pem -pubout -outform DER -out public.der
openssl rsa -in private.pem -pubout -out public.pem
```

```java
/*
 * Copyright 2010-2013 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
package com.amazonaws.samples;

import java.io.*;
import java.nio.*;
import java.security.*;
import java.security.spec.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.UUID;

import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.AmazonS3EncryptionClient;
import com.amazonaws.services.s3.model.Bucket;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ListObjectsRequest;
import com.amazonaws.services.s3.model.ObjectListing;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.amazonaws.services.s3.model.EncryptionMaterials;
import com.amazonaws.services.s3.model.CryptoConfiguration;
import com.amazonaws.services.s3.model.CryptoMode;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.EnvironmentVariableCredentialsProvider;

/**
 * This sample demonstrates how to make basic requests to Amazon S3 using
 * the AWS SDK for Java.
 * <p>
 * <b>Prerequisites:</b> You must have a valid Amazon Web Services developer
 * account, and be signed up to use Amazon S3. For more information on
 * Amazon S3, see http://aws.amazon.com/s3.
 * <p>
 * <b>Important:</b> Be sure to fill in your AWS access credentials in
 * ~/.aws/credentials (C:\Users\USER_NAME\.aws\credentials for Windows
 * users) before you try to run this sample.
 */
public class S3Sample {
    public static PublicKey getPublicKey(String file) throws Exception {
      File f = new File(file);
      FileInputStream fis = new FileInputStream(f);
      DataInputStream dis = new DataInputStream(fis);
      byte[] keyBytes = new byte[(int) f.length()];
      dis.readFully(keyBytes);
      dis.close();
      X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
      KeyFactory kf = KeyFactory.getInstance("RSA");
      return kf.generatePublic(spec);
    }

    public static PrivateKey getPrivateKey(String file) throws Exception {
      File f = new File(file);
      FileInputStream fis = new FileInputStream(f);
      DataInputStream dis = new DataInputStream(fis);
      byte[] keyBytes = new byte[(int) f.length()];
      dis.readFully(keyBytes);
      dis.close();
      PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
      KeyFactory kf = KeyFactory.getInstance("RSA");
      return kf.generatePrivate(spec);
    }

    public static void main(String[] args) throws Exception {
      KeyPair kp = new KeyPair(getPublicKey("public.der"), getPrivateKey("private.der"));
      System.out.println(kp);
      AWSCredentials credentials = new EnvironmentVariableCredentialsProvider().getCredentials();
      EncryptionMaterials encryptionMaterials = new EncryptionMaterials(kp);
      CryptoConfiguration cryptoConf = new CryptoConfiguration(CryptoMode.StrictAuthenticatedEncryption);
      AmazonS3EncryptionClient s3 = new AmazonS3EncryptionClient(credentials, encryptionMaterials, cryptoConf);
      // s3.putObject("bucket-name", "hello-java.txt", new File("hello.txt"));
      S3Object downloadedObject = s3.getObject("bucket-name", "hello-node.txt");
      BufferedReader in = new BufferedReader(new InputStreamReader(downloadedObject.getObjectContent()));
      String line;
      while ((line = in.readLine()) != null) {
        System.out.println(line);
      }
    }
}
```

```javascript
var fs = require('fs');

var iv = fs.readFileSync('iv.txt');
var key = fs.readFileSync('key.txt');

console.log(iv);
console.log(key);
// process.exit();

var AWS = require('aws-sdk');
var s3 = new AWS.S3();

var eet = require('./envelope-encryption-tools');

var rsa = eet.rsa;
var gcm = eet.aes256gcm;

rsa.encrypt('public.pem', rsa.padding.OAEP_SHA_256_MGF1_SHA_1, key, function(err, encKey) {
  // console.error(err);
  encIv = iv.toString('base64');

  console.log(encIv);
  console.log(encKey);

  var buf = [];
  var len = 0;
  var cipher = gcm.encrypt({
    key: key,
    iv: iv,
    appendMac: true
  });

  cipher.on('data', function(chunk) {
    buf.push(chunk);
    len += chunk.length;
    console.log(chunk);
  });

  cipher.on('end', function() {
    body = Buffer.concat(buf, len);

    s3.putObject({
      Bucket: 'bucket-name',
      Key: 'hello-node.txt',
      Body: body,
      Metadata: {
        'x-amz-key-v2': encKey,
        'x-amz-iv': encIv,
        'x-amz-matdesc': '{}',
        'x-amz-tag-len': '128',
        'x-amz-cek-alg': 'AES/GCM/NoPadding',
        'x-amz-wrap-alg': 'RSA/ECB/OAEPWithSHA-256AndMGF1Padding'
      }
    }, function(err, data) {
      console.error(err);
      console.log(data);
    });
  });

  cipher.end('hello world! - from node.js and decrypted in Java');
});
```
