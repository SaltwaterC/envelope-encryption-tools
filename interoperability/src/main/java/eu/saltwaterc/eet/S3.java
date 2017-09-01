package eu.saltwaterc.eet;

import java.io.*;
import java.security.*;
import java.security.spec.*;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.EnvironmentVariableCredentialsProvider;

import com.amazonaws.services.s3.model.EncryptionMaterials;
import com.amazonaws.services.s3.model.CryptoConfiguration;
import com.amazonaws.services.s3.model.CryptoMode;

import com.amazonaws.services.s3.AmazonS3EncryptionClient;
import com.amazonaws.services.s3.model.S3Object;

public class S3 {
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

    AWSCredentials credentials = new EnvironmentVariableCredentialsProvider().getCredentials();
    EncryptionMaterials encryptionMaterials = new EncryptionMaterials(kp);
    CryptoConfiguration cryptoConf = new CryptoConfiguration(CryptoMode.StrictAuthenticatedEncryption);
    // this is deprecated, but the non-deprecated interface is too bloody complicated for a non-Java dev
    // and the documentation is an absolute pile of rubbish
    AmazonS3EncryptionClient s3 = new AmazonS3EncryptionClient(credentials, encryptionMaterials, cryptoConf);

    // read object created by node.js
    S3Object downloadedObject = s3.getObject(System.getenv("EET_BUCKET"), "hello-node.txt");
    BufferedReader in = new BufferedReader(new InputStreamReader(downloadedObject.getObjectContent()));
    String line;
    while ((line = in.readLine()) != null) {
      System.out.println(line);
    }

    // write object to be read by node.js
    s3.putObject(System.getenv("EET_BUCKET"), "hello-java.txt", "hello world! - from AWS SDK for Java to be decrypted in node.js");
    System.out.println("Written hello-java.txt to S3 bucket " + System.getenv("EET_BUCKET"));
  }
}
