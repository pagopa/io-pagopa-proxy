interface RootObject {
  swagger: string;
  info: Info;
  host: string;
  basePath: string;
  tags: Tag[];
  produces: string[];
  paths: Paths;
  securityDefinitions: SecurityDefinitions;
  definitions: Definitions;
}

interface Definitions {
  Amount: Amount2;
  ApproveTerms: ApproveTerms;
  ApproveTermsRequest: ApproveTermsRequest;
  ChangeEmail: ChangeEmail;
  ChangeEmailRequest: ApproveTermsRequest;
  ChangePhone: ChangePhone;
  ChangePhoneRequest: ApproveTermsRequest;
  CheckCardBin: CheckCardBin;
  CheckCardBinRequest: ApproveTermsRequest;
  CheckCardBinResponse: ApproveTermsRequest;
  CheckUsername: CheckUsername;
  CheckUsernameResponse: ApproveTermsRequest;
  CreditCard: CreditCard;
  Device: Device;
  LogicDelete: LogicDelete;
  LogicDeleteRequest: ApproveTermsRequest;
  LogicDeleteResponse: ApproveTermsRequest;
  Login: Login;
  LoginRequest: ApproveTermsRequest;
  Otp: Otp;
  Pay: Pay;
  PayRequest: ApproveTermsRequest;
  Payment: Payment;
  PaymentResponse: ApproveTermsRequest;
  Psp: Psp;
  PspListResponse: PspListResponse;
  PspResponse: ApproveTermsRequest;
  Recovery: Recovery;
  RecoveryRequest: ApproveTermsRequest;
  ResourcesResponse: ResourcesResponse;
  Resume: Resume;
  ResumeRequest: ApproveTermsRequest;
  SendOtp: SendOtp;
  SendOtpRequest: ApproveTermsRequest;
  Session: Session;
  SessionResponse: ApproveTermsRequest;
  SetPassword: SetPassword;
  SetPasswordRequest: ApproveTermsRequest;
  SpidSession: SpidSession;
  SpidSessionResponse: ApproveTermsRequest;
  StartSession: StartSession;
  StartSessionRequest: ApproveTermsRequest;
  StartSpidSession: StartSpidSession;
  StartSpidSessionRequest: ApproveTermsRequest;
  Transaction: Transaction;
  TransactionListResponse: TransactionListResponse;
  TransactionResponse: ApproveTermsRequest;
  TransactionStatus: TransactionStatus;
  TransactionStatusResponse: ApproveTermsRequest;
  User: User;
  UserResponse: ApproveTermsRequest;
  VerifyOtp: VerifyOtp;
  VerifyOtpRequest: ApproveTermsRequest;
  VerifyUser: VerifyUser;
  VerifyUserRequest: ApproveTermsRequest;
  VerifyUserResponse: ApproveTermsRequest;
  Wallet: Wallet;
  WalletListResponse: PspListResponse;
  WalletRequest: ApproveTermsRequest;
  WalletResponse: ApproveTermsRequest;
}

interface Wallet {
  type: string;
  properties: Properties31;
  title: string;
}

interface Properties31 {
  creditCard: Schema;
  favourite: Currency;
  idPagamentoFromEC: Currency;
  idPsp: Amount;
  idWallet: Amount;
  lastUsage: Amount;
  psp: Schema;
  pspEditable: Currency;
  type: Os;
}

interface VerifyUser {
  type: string;
  properties: Properties30;
  title: string;
}

interface Properties30 {
  acceptTerms: Currency;
  cellphone: Currency;
  email: Currency;
  idPayment: Currency;
  name: Currency;
  newEmailReceiver: Currency;
  otp: Schema;
  password: Currency;
  puk: Currency;
  spidToken: Currency;
  status: Os;
  surname: Currency;
  temporaryCellphone: Currency;
  tokenEMailVerify: Currency;
  tokenEmailResetPassword: Currency;
  tokenPukVerified: Currency;
  username: Currency;
  verifiedPuk: Currency;
}

interface VerifyOtp {
  type: string;
  properties: Properties29;
  title: string;
}

interface Properties29 {
  context: Os;
  otp: Currency;
}

interface User {
  type: string;
  properties: Properties28;
  title: string;
}

interface Properties28 {
  acceptTerms: Currency;
  cellphone: Currency;
  email: Currency;
  name: Currency;
  otp: Schema;
  puk: Currency;
  spidToken: Currency;
  status: Os;
  surname: Currency;
  temporaryCellphone: Currency;
  username: Currency;
}

interface TransactionStatus {
  type: string;
  properties: Properties27;
  title: string;
}

interface Properties27 {
  acsUrl: Currency;
  finalStatus: Currency;
  idStatus: Amount;
  idTransaction: Amount;
  statusMessage: Currency;
}

interface TransactionListResponse {
  type: string;
  properties: Properties26;
  title: string;
}

interface Properties26 {
  data: Data;
  size: Amount;
  start: Amount;
  total: Amount;
}

interface Transaction {
  type: string;
  properties: Properties25;
  title: string;
}

interface Properties25 {
  amount: Schema;
  created: Amount;
  description: Currency;
  error: Currency;
  fee: Schema;
  grandTotal: Schema;
  id: Amount;
  idPsp: Amount;
  idStatus: Amount;
  idWallet: Amount;
  merchant: Currency;
  paymentModel: Amount;
  statusMessage: Currency;
  success: Currency;
  token: Currency;
  updated: Amount;
  urlCheckout3ds: Currency;
  urlRedirectPSP: Currency;
}

interface StartSpidSession {
  type: string;
  properties: Properties24;
  title: string;
}

interface Properties24 {
  token: Currency;
}

interface StartSession {
  type: string;
  properties: Properties23;
  title: string;
}

interface Properties23 {
  device: Schema;
  email: Currency;
  idPayment: Currency;
}

interface SpidSession {
  type: string;
  properties: Properties22;
  title: string;
}

interface Properties22 {
  token: Currency;
  verified: Currency;
}

interface SetPassword {
  type: string;
  properties: Properties21;
  title: string;
}

interface Properties21 {
  password: Currency;
  repeatPassword: Currency;
  tokenPukVerified: Currency;
  username: Currency;
}

interface Session {
  type: string;
  properties: Properties20;
  title: string;
}

interface Properties20 {
  sessionToken: Currency;
  user: Schema;
}

interface SendOtp {
  type: string;
  properties: Properties19;
  title: string;
}

interface Properties19 {
  context: Os;
  newReceiver: Currency;
  provider: Os;
}

interface Resume {
  type: string;
  properties: Properties18;
  title: string;
}

interface Properties18 {
  esito: Currency;
  paRes: Currency;
}

interface ResourcesResponse {
  type: string;
  title: string;
}

interface Recovery {
  type: string;
  properties: Properties17;
  title: string;
}

interface Properties17 {
  password: Currency;
  puk: Currency;
  repeatPassword: Currency;
}

interface PspListResponse {
  type: string;
  properties: Properties16;
  title: string;
}

interface Properties16 {
  data: Data;
}

interface Data {
  type: string;
  items: Schema;
}

interface Psp {
  type: string;
  properties: Properties15;
  title: string;
}

interface Properties15 {
  appChannel: Currency;
  businessName: Currency;
  cancelled: Currency;
  fixedCost: Schema;
  flagStamp: Currency;
  id: Amount;
  idCard: Amount;
  idChannel: Currency;
  idIntermediary: Currency;
  idPsp: Currency;
  lingua: Os;
  logoPSP: Currency;
  paymentModel: Amount;
  paymentType: Currency;
  serviceAvailability: Currency;
  serviceDescription: Currency;
  serviceLogo: Currency;
  serviceName: Currency;
  tags: UserStatusEnum;
  urlInfoChannel: Currency;
}

interface Payment {
  type: string;
  properties: Properties14;
  title: string;
}

interface Properties14 {
  amount: Schema;
  bolloDigitale: Currency;
  cancelled: Currency;
  email: Currency;
  id: Amount;
  idPayment: Currency;
  receiver: Currency;
  subject: Currency;
  urlRedirectEc: Currency;
}

interface Pay {
  type: string;
  properties: Properties13;
  title: string;
}

interface Properties13 {
  cvv: Currency;
  idWallet: Amount;
  mobileToken: Currency;
  tipo: Currency;
}

interface Otp {
  type: string;
  properties: Properties12;
  title: string;
}

interface Properties12 {
  value: Currency;
}

interface Login {
  type: string;
  properties: Properties11;
  title: string;
}

interface Properties11 {
  loginFromSSO: Currency;
  password: Currency;
  username: Currency;
}

interface LogicDelete {
  type: string;
  properties: Properties10;
  title: string;
}

interface Properties10 {
  email: Currency;
  userStatusEnum: UserStatusEnum;
}

interface UserStatusEnum {
  type: string;
  items: Os;
}

interface Device {
  type: string;
  properties: Properties9;
  title: string;
}

interface Properties9 {
  idDevice: Amount;
  idNotificationConfig: Currency;
  idUser: Amount;
  os: Os;
  scale: Amount;
  status: Os;
  token: Currency;
  userAgent: Currency;
}

interface Os {
  type: string;
  enum: string[];
}

interface CreditCard {
  type: string;
  properties: Properties8;
  title: string;
}

interface Properties8 {
  brandLogo: Currency;
  expireMonth: Currency;
  expireYear: Currency;
  flag3dsVerified: Currency;
  holder: Currency;
  id: Amount;
  pan: Currency;
  securityCode: Currency;
}

interface CheckUsername {
  type: string;
  properties: Properties7;
  title: string;
}

interface Properties7 {
  available: Currency;
  username: Currency;
}

interface CheckCardBin {
  type: string;
  properties: Properties6;
  title: string;
}

interface Properties6 {
  cardBin: Currency;
  urlLogo: Currency;
}

interface ChangePhone {
  type: string;
  properties: Properties5;
  title: string;
}

interface Properties5 {
  newCellphone: Currency;
  tokenPukVerified: Currency;
}

interface ChangeEmail {
  type: string;
  properties: Properties4;
  title: string;
}

interface Properties4 {
  newEmail: Currency;
  tokenPukVerified: Currency;
}

interface ApproveTermsRequest {
  type: string;
  properties: Properties3;
  title: string;
}

interface Properties3 {
  data: Schema;
}

interface ApproveTerms {
  type: string;
  properties: Properties2;
  title: string;
}

interface Properties2 {
  privacy: Currency;
  terms: Currency;
}

interface Amount2 {
  type: string;
  properties: Properties;
  title: string;
}

interface Properties {
  amount: Amount;
  currency: Currency;
  currencyNumber: Currency;
  decimalDigits: Amount;
}

interface Currency {
  type: string;
}

interface Amount {
  type: string;
  format: string;
}

interface SecurityDefinitions {
  Bearer: Bearer;
}

interface Bearer {
  type: string;
  name: string;
  in: string;
}

interface Paths {
  "/v1/payments/{id}": V1paymentsid;
  "/v1/payments/{id}/actions/check": V1paymentsidactionscheck;
  "/v1/payments/{id}/actions/check-internal": V1paymentsidactionscheck;
  "/v1/payments/{id}/actions/pay": V1paymentsidactionspay;
  "/v1/psps": V1psps;
  "/v1/psps/{id}": V1pspsid;
  "/v1/resources": V1resources;
  "/v1/resources/psp/{id}": V1resourcespspid;
  "/v1/resources/service/{id}": V1resourcespspid;
  "/v1/transactions": V1transactions;
  "/v1/transactions/{id}": V1pspsid;
  "/v1/transactions/{id}/actions/check": V1transactionsidactionscheck;
  "/v1/transactions/{id}/actions/resume": V1transactionsidactionsresume;
  "/v1/users": V1transactions;
  "/v1/users/actions/approve-terms": V1usersactionsapproveterms;
  "/v1/users/actions/change-email": V1usersactionsapproveterms;
  "/v1/users/actions/change-phone": V1usersactionsapproveterms;
  "/v1/users/actions/check-username-availability": V1transactionsidactionscheck;
  "/v1/users/actions/generate-reset-password": V1transactionsidactionscheck;
  "/v1/users/actions/logic-delete-user": V1usersactionsapproveterms;
  "/v1/users/actions/login": V1usersactionsapproveterms;
  "/v1/users/actions/logout": V1usersactionslogout;
  "/v1/users/actions/recovery": V1usersactionsapproveterms;
  "/v1/users/actions/send-otp": V1usersactionssendotp;
  "/v1/users/actions/set-password": V1usersactionssetpassword;
  "/v1/users/actions/signin": V1usersactionsapproveterms;
  "/v1/users/actions/start-session": V1usersactionsstartsession;
  "/v1/users/actions/start-session-spid": V1usersactionsstartsessionspid;
  "/v1/users/actions/validate-email/{id}": V1transactionsidactionscheck;
  "/v1/users/actions/validate-reset-password/{id}": V1transactionsidactionscheck;
  "/v1/users/actions/verify-otp": V1usersactionsapproveterms;
  "/v1/users/actions/verify-password": V1usersactionsapproveterms;
  "/v1/users/actions/verify-puk": V1usersactionsapproveterms;
  "/v1/wallet": V1wallet;
  "/v1/wallet/actions/check-card-bin": V1usersactionsapproveterms;
  "/v1/wallet/{id}": V1walletid;
  "/v1/wallet/{id}/actions/confirm": V1walletidactionsconfirm;
  "/v1/wallet/{id}/actions/favourite": V1walletidactionsconfirm;
}

interface V1walletidactionsconfirm {
  post: Post7;
}

interface Post7 {
  tags: string[];
  summary: string;
  operationId: string;
  consumes: string[];
  parameters: Parameter4[];
  responses: Responses3;
  security: Security[];
}

interface V1walletid {
  get: Get3;
  put: Put;
  delete: Delete2;
}

interface Delete2 {
  tags: string[];
  summary: string;
  operationId: string;
  parameters: Parameter4[];
  responses: Responses;
  security: Security[];
}

interface Put {
  tags: string[];
  summary: string;
  operationId: string;
  consumes: string[];
  parameters: Parameter6[];
  responses: Responses3;
  security: Security[];
}

interface Parameter6 {
  name: string;
  in: string;
  description: string;
  required: boolean;
  type?: string;
  format?: string;
  schema?: Schema;
}

interface V1wallet {
  get: Get6;
  post: Post3;
}

interface V1usersactionsstartsessionspid {
  get: Get;
  post: Post6;
}

interface V1usersactionsstartsession {
  post: Post6;
}

interface Post6 {
  tags: string[];
  summary: string;
  operationId: string;
  consumes: string[];
  parameters: Parameter5[];
  responses: Responses3;
}

interface V1usersactionssetpassword {
  post: Post3;
  put: Post3;
}

interface V1usersactionssendotp {
  post: Post5;
}

interface Post5 {
  tags: string[];
  summary: string;
  operationId: string;
  consumes: string[];
  parameters: Parameter5[];
  responses: Responses5;
  security: Security[];
}

interface V1usersactionslogout {
  post: Post4;
}

interface Post4 {
  tags: string[];
  summary: string;
  operationId: string;
  consumes: string[];
  responses: Responses5;
  security: Security[];
}

interface V1usersactionsapproveterms {
  post: Post3;
}

interface Post3 {
  tags: string[];
  summary: string;
  operationId: string;
  consumes: string[];
  parameters: Parameter5[];
  responses: Responses3;
  security: Security[];
}

interface Parameter5 {
  in: string;
  name: string;
  description: string;
  required: boolean;
  schema: Schema;
}

interface V1transactionsidactionsresume {
  post: Post2;
}

interface Post2 {
  tags: string[];
  summary: string;
  operationId: string;
  consumes: string[];
  parameters: Parameter2[];
  responses: Responses5;
  security: Security[];
}

interface Responses5 {
  "200": _200;
  "201": _200;
  "401": _200;
  "403": _200;
  "404": _200;
}

interface V1transactionsidactionscheck {
  get: Get7;
}

interface Get7 {
  tags: string[];
  summary: string;
  operationId: string;
  parameters: Parameter[];
  responses: Responses2;
  security: Security[];
}

interface V1transactions {
  get: Get6;
}

interface Get6 {
  tags: string[];
  summary: string;
  operationId: string;
  responses: Responses2;
  security: Security[];
}

interface V1resourcespspid {
  get: Get5;
}

interface Get5 {
  tags: string[];
  summary: string;
  operationId: string;
  parameters: Parameter4[];
  responses: Responses4;
}

interface Responses4 {
  "200": _200;
  "401": _200;
  "403": _200;
  "404": _200;
}

interface V1resources {
  get: Get4;
}

interface Get4 {
  tags: string[];
  summary: string;
  operationId: string;
  responses: Responses2;
}

interface V1pspsid {
  get: Get3;
}

interface Get3 {
  tags: string[];
  summary: string;
  operationId: string;
  parameters: Parameter4[];
  responses: Responses2;
  security: Security[];
}

interface Parameter4 {
  name: string;
  in: string;
  description: string;
  required: boolean;
  type: string;
  format: string;
}

interface V1psps {
  get: Get2;
}

interface Get2 {
  tags: string[];
  summary: string;
  operationId: string;
  parameters: Parameter3[];
  responses: Responses2;
  security: Security[];
}

interface Parameter3 {
  name: string;
  in: string;
  description: string;
  required: boolean;
  type: string;
  format?: string;
}

interface V1paymentsidactionspay {
  post: Post;
}

interface Post {
  tags: string[];
  summary: string;
  operationId: string;
  consumes: string[];
  parameters: Parameter2[];
  responses: Responses3;
  security: Security[];
}

interface Responses3 {
  "200": _2002;
  "201": _200;
  "401": _200;
  "403": _200;
  "404": _200;
}

interface Parameter2 {
  name: string;
  in: string;
  description: string;
  required: boolean;
  type?: string;
  schema?: Schema;
}

interface V1paymentsidactionscheck {
  get: Get;
}

interface Get {
  tags: string[];
  summary: string;
  operationId: string;
  parameters: Parameter[];
  responses: Responses2;
}

interface Responses2 {
  "200": _2002;
  "401": _200;
  "403": _200;
  "404": _200;
}

interface _2002 {
  description: string;
  schema: Schema;
}

interface Schema {
  $ref: string;
}

interface V1paymentsid {
  delete: Delete;
}

interface Delete {
  tags: string[];
  summary: string;
  operationId: string;
  parameters: Parameter[];
  responses: Responses;
  security: Security[];
}

interface Security {
  Bearer: any[];
}

interface Responses {
  "200": _200;
  "204": _200;
  "401": _200;
  "403": _200;
}

interface _200 {
  description: string;
}

interface Parameter {
  name: string;
  in: string;
  description: string;
  required: boolean;
  type: string;
}

interface Tag {
  name: string;
  description: string;
}

interface Info {
  description: string;
  version: string;
  title: string;
  termsOfService: string;
  contact: Contact;
  license: License;
}

interface License {
  name: string;
  url: string;
}

interface Contact {}
