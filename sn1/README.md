# Snowflake

[![GoDoc](https://godoc.org/github.com/Twitter/Snowflake?status.svg)](http://godoc.org/github.com/Twitter/Snowflake)
[![Go Report Card](https://goreportcard.com/badge/github.com/Twitter/Snowflake)](https://goreportcard.com/report/github.com/Twitter/Snowflake)

Snowflake is a distributed unique ID generator inspired by [Twitter's Snowflake](https://blog.twitter.com/2010/announcing-snowflake).

Snowflake focuses on lifetime and performance on many host/core environment.
So it has a different bit assignment from Snowflake.
A Snowflake ID is composed of

    39 bits for time in units of 10 msec
     8 bits for a sequence number
    16 bits for a machine id

As a result, Snowflake has the following advantages and disadvantages:

- The lifetime (174 years) is longer than that of Snowflake (69 years)
- It can work in more distributed machines (2^16) than Snowflake (2^10)
- It can generate 2^8 IDs per 10 msec at most in a single machine/thread (slower than Snowflake)

However, if you want more generation rate in a single host,
you can easily run multiple Snowflake ID generators concurrently using goroutines.

## Usage

The function New creates a new Snowflake instance.

```go
func New(st Settings) (*Snowflake, error)
```

You can configure Snowflake by the struct Settings:

```go
type Settings struct {
	StartTime      time.Time
	MachineID      func() (uint16, error)
	CheckMachineID func(uint16) bool
}
```

- StartTime is the time since which the Snowflake time is defined as the elapsed time.
  If StartTime is 0, the start time of the Snowflake is set to "2014-09-01 00:00:00 +0000 UTC".
  If StartTime is ahead of the current time, Snowflake is not created.

- MachineID returns the unique ID of the Snowflake instance.
  If MachineID returns an error, Snowflake is not created.
  If MachineID is nil, default MachineID is used.
  Default MachineID returns the lower 16 bits of the private IP address.

- CheckMachineID validates the uniqueness of the machine ID.
  If CheckMachineID returns false, Snowflake is not created.
  If CheckMachineID is nil, no validation is done.

In order to get a new unique ID, you just have to call the method NextID.

```go
func (sf *Snowflake) NextID() (uint64, error)
```

NextID can continue to generate IDs for about 174 years from StartTime.
But after the Snowflake time is over the limit, NextID returns an error.

> **Note:**
> Snowflake currently does not use the most significant bit of IDs,
> so you can convert Snowflake IDs from `uint64` to `int64` safely.

## AWS VPC and Docker

The [awsutil](https://github.com/Twitter/Snowflake/blob/master/awsutil) package provides
the function AmazonEC2MachineID that returns the lower 16-bit private IP address of the Amazon EC2 instance.
It also works correctly on Docker
by retrieving [instance metadata](http://docs.aws.amazon.com/en_us/AWSEC2/latest/UserGuide/ec2-instance-metadata.html).

[AWS VPC](http://docs.aws.amazon.com/en_us/AmazonVPC/latest/UserGuide/VPC_Subnets.html)
is assigned a single CIDR with a netmask between /28 and /16.
So if each EC2 instance has a unique private IP address in AWS VPC,
the lower 16 bits of the address is also unique.
In this common case, you can use AmazonEC2MachineID as Settings.MachineID.

See [example](https://github.com/Twitter/Snowflake/blob/master/example) that runs Snowflake on AWS Elastic Beanstalk.

## License

The MIT License (MIT)

See [LICENSE](https://github.com/Twitter/Snowflake/blob/master/LICENSE) for details.
