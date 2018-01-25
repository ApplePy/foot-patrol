// tslint:disable:no-bitwise

// NOTE: numbers must just be on their own bit to allow bit ORing
export enum Role {
  ANONYMOUS   = 0,
  STUDENT     = 1,
  VOLUNTEER   = 2,
  DISPATCHER  = 4,
  ADMIN       = 8,
  GOD         = STUDENT | VOLUNTEER | DISPATCHER | ADMIN
}
