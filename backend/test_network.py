import socket
import dns.resolver

srv_domain = "_mongodb._tcp.cluster0.qb99ikc.mongodb.net"
try:
    print(f"Resolving SRV record for {srv_domain}...")
    answers = dns.resolver.resolve(srv_domain, 'SRV')
    for rdata in answers:
        host = rdata.target.to_text(omit_final_dot=True)
        port = rdata.port
        print(f"Resolved to {host}:{port}")
        
        # Test TCP connection
        try:
            print(f"Attempting TCP connection to {host}:{port}...")
            sock = socket.create_connection((host, port), timeout=5)
            print(f"SUCCESS: Connected to {host} on port {port}")
            sock.close()
        except Exception as e:
            print(f"FAILED to connect to {host}:{port} - {e.__class__.__name__}: {e}")
except Exception as e:
    print(f"DNS resolution failed: {e.__class__.__name__}: {e}")
