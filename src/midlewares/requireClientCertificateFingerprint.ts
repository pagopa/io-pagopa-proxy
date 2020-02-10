import * as express from "express";

import { asn1, md, pki } from "node-forge";

import { ExpressMiddleware } from "./types";

const CLIENT_CERTIFICATE_HEADER_NAME = "x-arr-clientcert";

export function requireClientCertificateFingerprint(
  validFingerprint: string
): ExpressMiddleware {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const clientCertificateBase64 = req.get(CLIENT_CERTIFICATE_HEADER_NAME);

      if (
        clientCertificateBase64 !== undefined &&
        clientCertificateBase64 !== ""
      ) {
        const pem = `-----BEGIN CERTIFICATE-----${clientCertificateBase64}-----END CERTIFICATE-----`;
        const clientCertificate = pki.certificateFromPem(pem);

        const fingerprint = md.sha256
          .create()
          .update(
            asn1.toDer(pki.certificateToAsn1(clientCertificate)).getBytes()
          )
          .digest()
          .toHex()
          .toUpperCase();

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
