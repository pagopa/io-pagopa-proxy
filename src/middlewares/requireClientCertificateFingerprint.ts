/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/**
 * Extract base64 client certificate from the header and verify
 * if the fingerprint is valid.
 */

import * as express from "express";
import { asn1, md, pki } from "node-forge";

const CLIENT_CERTIFICATE_HEADER_NAME = "x-arr-clientcert";

function getFingerprintFromCertificate(certificate: pki.Certificate): string {
  return md.sha256
    .create()
    .update(asn1.toDer(pki.certificateToAsn1(certificate)).getBytes())
    .digest()
    .toHex()
    .toUpperCase();
}

export function requireClientCertificateFingerprint(
  validFingerprint: string
): express.Handler {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      // Get the base64 representation of client certificate from the header
      const clientCertificateBase64 = req.get(CLIENT_CERTIFICATE_HEADER_NAME);

      if (
        clientCertificateBase64 !== undefined &&
        clientCertificateBase64 !== ""
      ) {
        const pem = `-----BEGIN CERTIFICATE-----${clientCertificateBase64}-----END CERTIFICATE-----`;
        const clientCertificate = pki.certificateFromPem(pem);

        // Extract the fingerprint
        const fingerprint = getFingerprintFromCertificate(clientCertificate);

        // Very the fingerprint
        if (fingerprint !== validFingerprint) {
          res.status(403).send("Invalid client certificate");
        } else {
          next();
        }
      }

      res.status(403).send("Client certificate required");
    } catch (e) {
      res.status(403).send("Error decoding certificate");
    }
  };
}
