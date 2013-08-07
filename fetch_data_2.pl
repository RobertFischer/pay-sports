#!/usr/bin/perl

use warnings;
use strict;

use local::lib;
use HTTP::Tiny;
use IO::Socket::SSL;
use Net::SSLeay;
use Mozilla::CA;
use JSON;
use Text::CSV::Hashify;
use File::Temp "tempfile";
use File::Copy;

my %data_pages = (
  'https://docs.google.com/spreadsheet/pub?key=0Asznh-RbUyRIdEdLRVQ3bU80VG1Mc1ZXMDExcUNhTmc&single=true&gid=0&range=A3%3AD100&output=csv' => {
    file => "carriage_fees",
    key => "Network"
  },
  'https://docs.google.com/spreadsheet/pub?key=0Asznh-RbUyRIdEdLRVQ3bU80VG1Mc1ZXMDExcUNhTmc&single=true&gid=5&range=A3%3AD40&output=csv' => {
    file => "rights_fees_original",
    key => "Key"
  },
  'https://docs.google.com/spreadsheet/pub?key=0Asznh-RbUyRIdEdLRVQ3bU80VG1Mc1ZXMDExcUNhTmc&single=true&gid=1&range=A3%3AV100&output=csv' => {
    file => "packages",
    key => "Channels"
  }
);

my($fh,$filename);

while(my($src,$file_data) = each %data_pages) {
  my $file = $file_data->{'file'};
  my $key = $file_data->{'key'};

  # Mirror the CSV file
  my $http = HTTP::Tiny->new(verify_SSL => 1);
  my $response = $http->mirror($src, "$file.csv");
  if(!($response->{'success'})) {
    die "Could not download $src file: $response->{'status'} $response->{'reason'} -- $response->{'content'}";
  }

  # Take out the empty lines
  ($fh,$filename) = tempfile();
  open(my $csvfh, "<", "$file.csv") or die "Cannot open the CSV file for filtering: $!";
  foreach my $line (grep(!/^,*$/, <$csvfh>)) {
    chomp $line;
    print $fh $line;
    print $fh "\n";
  }
  close $csvfh;
  close $fh;
  move($filename, "$file.csv") or die "Could not rename the temp file to $file.csv: $!";
  chmod 0644, "$file.csv";

  # Create the JSON file
  ($fh,$filename) = tempfile();
  print $fh encode_json(hashify("$file.csv", $key));
  close $fh;
  move($filename, "$file.json") or die "Could not rename the temp file to $file.json: $!";
  chmod 0644, "$file.json";
}

# Fix rights fees
open($fh, "<", "rights_fees_original.json") or die "Cannot open rights_fees_original.json for re-reading";
my %json = %{decode_json(scalar(<$fh>))};
close $fh;
my %new_rights = ();
while(my($key,$data) = each %json) {
	$new_rights{$data->{League}}->{$data->{Network}} = $data->{'Payout (millions)'};
}
($fh,$filename) = tempfile();
print $fh encode_json(\%new_rights);
close $fh;
move($filename, "rights_fees.json") or die "Could not rename the fixed rights temp file to rights_fees.json";
chmod 0644, "rights_fees.json";
