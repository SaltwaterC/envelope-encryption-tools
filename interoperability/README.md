## About

Subproject of envelope-encryption-tools to test the interoperability with AWS SDK for Java. The integration tests only the Envelope V2 scheme. It provides reads / writes on both sides.

## How to use

The AWS credentials need to be supplied as environment variables. `EET_BUCKET` is also an environment variable which points the integration suite to the bucket where the writes / reads take place. The build tool is `jake` which needs to be installed with `npm -g install jake`. Maven and JDK installations need to be available as well which are left as exercise for the reader.

Everything is chained into the default jake task. In a nutshell:

```bash
AWS_ACCESS_KEY_ID=key_id AWS_SECRET_ACCESS_KEY=secret_key EET_BUCKET=bucket-name jake
```
