# s3-tools

A set of tools to interact with buckets from the command line.

## Commands

Available commands are as follows:

- `lb`: list buckets
- `ls`: list objects in a bucket
- `lsv`: list object versions in a version-enabled bucket
- `rm`: remove an object (adding a delete marker in a version-enabled bucket)
- `rmv`: remove an object version, or remove all object versions

## Installing

Install this using `npm install -g CodeNow/s3-tools`. For this command to work, you need to have `S3TOOLS_AWS_ACCESS_KEY` and `S3TOOLS_AWS_SECRET_KEY` set in your environment with your valid credentials.

## Options

For `ls`, `lv`, `rm`, and `rmv`, there are options that you can and need to pass along:

- `--bucket BUCKET_NAME`: name of the bucket to work with
- `--prefix PREFIX`: prefix if you want to specify what subset of objects you want to work with
- `--delimiter DELIMITER`: delimiter if you want to break the keys down (for example, by 'folders' would use the delimiter `/`)
- `--key KEY`: key of an individual object to list
- `--rmv-all`: remove all versions of the object(s)

## Examples

#### List all buckets

```
s3-tools lb
```

#### List all objects in a bucket (ALL of them, so careful)

```
s3-tools ls --bucket BUCKET_NAME
```

#### List all objects in a folder like method

```
s3-tools ls --bucket BUCKET_NAME --delimiter /
```

#### List all versions of objects in a bucket (again, ALL of them)

```
s3-tools lsv --bucket BUCKET_NAME
```

#### List all versions of a specific object

```
s3-tools lsv --bucket BUCKET_NAME --key OBJECT_KEY
```

#### Remove all the objects in a bucket

```
s3-tools rm --bucket BUCKET_NAME
```

#### Remove the object and ALL versions of that key in a bucket

```
s3-tools rmv --rmv-all --bucket BUCKET_NAME --key OBJECT_KEY
```

#### Remove the last version of an object key

```
s3-tools rmv --bucket BUCKET_NAME --key OBJECT_KEY
```
