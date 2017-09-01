package eu.saltwaterc.eet;

import java.io.*;
import java.security.*;
import java.security.spec.*;

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
    System.out.println(kp);
  }
}
