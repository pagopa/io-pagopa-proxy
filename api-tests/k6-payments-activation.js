import http from 'k6/http';
import { check } from 'k6';
import { sleep } from 'k6';

export let options = {
    stages: [
      { duration: '1m', target: 3 },
      { duration: '1m', target: 3 },
      { duration: '1m', target: 0 },
    ],
  };


export function setup() {
    return {
    };
}

export default function () {

    const min = 302001000000000000;
    const max = 302001999999999999;
    const urlBasePath = "http://localhost:3000";
    const rptIdNM3 = "01234567891010302004567890123";
    const rptIdRandom = `77777777777${ Math.floor(Math.random() * (max - min + 1) + min)}`;
    const rptId = Math.floor((Math.random() * 2) + 1) == 1 ? rptIdNM3 : rptIdRandom;

    const headersParams = {
        headers: {
            'Content-Type': 'application/json',
            'X-Client-Id' : 'CLIENT_CHECKOUT'
        },
    };
    
    // 1. Verification Step
    const tagVerify = {
        pagoPaMethod: "GetPaymentInfo",
    };
    const verifyResponse = http.get(`${urlBasePath}/payment-requests/${rptId}?recaptchaResponse=token`, headersParams, {
        tags: tagVerify
    });

    check(verifyResponse, { 'verifyResponse status is 200': (r) => r.status === 200 }, tagVerify);

    if ( verifyResponse.status != 200 ) {

        console.log("verifyResponse: " + verifyResponse.status);
        console.log(JSON.stringify(verifyResponse.json()));
    } else {

        // 2. Activation Step
        const codiceContestoPagamento = verifyResponse.json().codiceContestoPagamento;
        const importoSingoloVersamento = verifyResponse.json().importoSingoloVersamento;
        const tagActivation = {
            pagoPaMethod: "PostActivation",
        };
        
        const activationResponse = http.post(
            `${urlBasePath}/payment-activations`,
            JSON.stringify({ 
                rptId, 
                codiceContestoPagamento,
                importoSingoloVersamento
            }),
            headersParams,
            {
            tags: tagActivation
            }
        );

        check(activationResponse, { 'activationResponse status is 200': (r) => r.status === 200 }, tagActivation);

        if ( activationResponse.status != 200 ) {

            console.log("activationResponse: " + activationResponse.status);
            console.log(JSON.stringify(activationResponse.json()));

        } else {

            // 3. Activation Step
            const tagActivationStatus = {
                pagoPaMethod: "GetActivationStatus",
            };

            let activationCompleted = false;
            const maxCheck = 50;
            let checks = 0;
            let activationStatusResponse;

            while ( !activationCompleted && checks < maxCheck ){
                activationStatusResponse = http.get(`${urlBasePath}/payment-activations/${codiceContestoPagamento}`, headersParams, {
                    tags: tagActivationStatus,
                });
                checks++;
                activationCompleted = activationStatusResponse.status == 200 ? true : false;
                sleep(2);
            }

            if ( activationStatusResponse.status != 200 ) {
                console.log(activationStatusResponse.status);
            }

            check(activationStatusResponse, { 'activationStatusResponse status is 200': (r) => r.status === 200 }, tagActivation);
        }
    }
}
