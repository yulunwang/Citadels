use strict;
use warnings;
use IO::Socket::INET;
use Cwd 'abs_path';
use File::Basename;

my $port = $ENV{PORT} || 3000;
my $root = dirname(abs_path($0));

my %mime = (
    '.html'=>'text/html', '.css'=>'text/css', '.js'=>'application/javascript',
    '.json'=>'application/json', '.svg'=>'image/svg+xml', '.png'=>'image/png',
    '.jpg'=>'image/jpeg', '.webp'=>'image/webp', '.ico'=>'image/x-icon',
    '.woff2'=>'font/woff2', '.woff'=>'font/woff', '.ttf'=>'font/ttf',
);

my $server = IO::Socket::INET->new(
    LocalAddr => '127.0.0.1', LocalPort => $port,
    Proto => 'tcp', Listen => 5, ReuseAddr => 1,
) or die "Cannot bind to port $port: $!\n";

print "Serving $root on http://localhost:$port\n";
STDOUT->flush();

while (my $client = $server->accept()) {
    my $req = <$client>;
    next unless $req;
    # consume headers
    while (my $h = <$client>) { last if $h =~ /^\r?\n$/; }

    my ($method, $path) = $req =~ /^(\S+)\s+(\S+)/;
    $path = '/index.html' if $path eq '/';
    $path =~ s/\?.*//;  # strip query string
    $path =~ s/%([0-9A-Fa-f]{2})/chr(hex($1))/ge;  # decode %XX

    my $file = $root . $path;
    $file =~ s{/}{\\}g if $^O eq 'MSWin32';

    if (-f $file) {
        open my $fh, '<:raw', $file or next;
        local $/; my $data = <$fh>; close $fh;
        my ($ext) = $file =~ /(\.[^.]+)$/;
        my $ct = $mime{lc($ext||'')} || 'application/octet-stream';
        my $len = length($data);
        print $client "HTTP/1.1 200 OK\r\nContent-Type: $ct\r\nContent-Length: $len\r\nConnection: close\r\n\r\n$data";
    } else {
        print $client "HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\nConnection: close\r\n\r\nNot Found";
    }
    close $client;
}
