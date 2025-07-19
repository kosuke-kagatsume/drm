import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsOrderIdConstraint implements ValidatorConstraintInterface {
  validate(orderId: any, _args: ValidationArguments) {
    // 数値型または文字列型を許可
    if (typeof orderId === 'number') {
      // 8桁の数値かチェック（10000000 ～ 99999999）
      return orderId >= 10000000 && orderId <= 99999999 && Number.isInteger(orderId);
    }

    if (typeof orderId === 'string') {
      // 文字列の場合も8桁数値のみを許可
      const orderIdRegex = /^[1-9][0-9]{7}$/; // 先頭0を許可しない
      return orderIdRegex.test(orderId);
    }

    return false;
  }

  defaultMessage(_args: ValidationArguments) {
    return '発注IDは8桁の数値である必要があります';
  }
}

export function IsOrderId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsOrderIdConstraint,
    });
  };
}
