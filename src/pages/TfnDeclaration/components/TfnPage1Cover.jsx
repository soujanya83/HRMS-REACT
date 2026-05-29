import React from "react";
import atoBlackLogo from "../../../assets/ato_logo_black.png";
import {
  TfnPage,
  GreenTopBar,
  RedMinusIcon,
  OrangeAlertIcon,
  BlueArrowIcon,
  IconRow,
  TfnBulletList,
  AtoLink,
} from "./TfnFormComponents";

const TfnPage1Cover = () => (
  <TfnPage>
    <GreenTopBar text="Instructions and form for taxpayers" />

    <div className="px-8 pt-6 pb-4 flex-1 flex flex-col">
      <div className="border-2 border-[#33AD5B] p-6 mb-6">
        <h1 className="text-[48px] font-light text-gray-900 leading-[1.05] tracking-tight">
          Tax file number
          <br />
          declaration
        </h1>
        <p className="text-[13px] text-gray-800 mt-4 leading-snug max-w-[520px]">
          Information you provide in this declaration will allow your payer to
          work out how much tax to withhold from payments made to you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        <div className="space-y-4">
          <IconRow icon={<RedMinusIcon />}>
            This is not a TFN application form. To apply for a TFN, go to{" "}
            <AtoLink href="ato.gov.au/tfn" />
          </IconRow>

          <div>
            <IconRow icon={<OrangeAlertIcon />} className="mb-2">
              <strong>Terms we use</strong>
            </IconRow>
            <p className="text-[13px] text-gray-800 mb-2 ml-[28px]">When we say:</p>
            <TfnBulletList
              className="ml-[28px]"
              items={[
                <>
                  <strong>payer</strong>, we mean the business or individual
                  making payments under the pay as you go (PAYG) withholding
                  system
                </>,
                <>
                  <strong>payee</strong>, we mean the individual being paid.
                </>,
              ]}
            />
          </div>

          <div>
            <h2 className="text-[16px] font-bold text-gray-900 mb-2">
              Who should complete this form?
            </h2>
            <p className="text-[13px] text-gray-800 mb-2 leading-snug">
              You should complete this form before you start to receive payments
              from a new payer – for example:
            </p>
            <TfnBulletList
              items={[
                "payments for work and services as an employee, company director or office holder",
                "payments under return-to-work schemes, labour hire arrangements or other specified payments",
                "benefit and compensation payments",
                "superannuation benefits.",
              ]}
            />
          </div>

          <IconRow icon={<OrangeAlertIcon />}>
            You need to provide all information requested on this form. Providing
            the wrong information may lead to incorrect amounts of tax being
            withheld from payments made to you.
          </IconRow>
        </div>

        <div className="space-y-4">
          <div>
            <IconRow icon={<OrangeAlertIcon />} className="mb-2">
              <strong>You don't need to complete this form if you:</strong>
            </IconRow>
            <TfnBulletList
              className="ml-[28px]"
              items={[
                <>
                  are a beneficiary wanting to provide your tax file number (TFN)
                  to the trustee of a closely held trust. For more information,
                  visit <AtoLink href="ato.gov.au/trustsandtfnwithholding" />
                </>,
                "are receiving superannuation benefits from a super fund and have been taken to have quoted your TFN to the trustee of the super fund",
                <>
                  want to claim the seniors and pensioners tax offset by reducing
                  the amount withheld from payments made to you. You should
                  complete a withholding declaration form (NAT 3093)
                </>,
                <>
                  want to claim a zone, overseas forces or invalid and invalid
                  carer tax offset by reducing the amount withheld from payments
                  made to you. You should complete a withholding declaration form
                  (NAT 3093).
                </>,
              ]}
            />
          </div>

          <IconRow icon={<BlueArrowIcon />}>
            For more information about your entitlement, visit{" "}
            <AtoLink href="ato.gov.au/taxoffsets" />
          </IconRow>
        </div>
      </div>

      <div className="flex justify-between items-end pt-4 mt-auto border-t border-gray-300">
        <span className="text-[12px] text-gray-500">NAT 3092-06.2019</span>
        <img src={atoBlackLogo} alt="Australian Taxation Office" className="h-[52px] w-auto" />
      </div>
    </div>
  </TfnPage>
);

export default TfnPage1Cover;
