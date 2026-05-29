import React from "react";
import {
  TfnPage,
  RedMinusIcon,
  BlueArrowIcon,
  IconRow,
  TfnBulletList,
  InstructionFooter,
  AtoLink,
} from "./TfnFormComponents";

const TfnPage6PayerInfo = () => (
  <TfnPage>
    <div className="px-8 pt-6 pb-3 flex-1 flex flex-col text-[11px]">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-[28px] font-light text-gray-400">Payer information</h2>
          <p className="text-gray-800 leading-snug">
            The following information will help you comply with your pay as you go
            (PAYG) withholding obligations.
          </p>

          <IconRow icon={<RedMinusIcon />}>
            <strong>Is your employee entitled to work in Australia?</strong>
            <br />
            It is a criminal offence to knowingly or recklessly allow someone to
            work, or to refer someone for work, where that person is from overseas
            and is either in Australia illegally or is working in breach of their
            visa conditions.
            <br />
            <br />
            People or companies convicted of these offences may face fines and/or
            imprisonment. To avoid penalties, ensure your prospective employee has
            a valid visa to work in Australia before you employ them. For more
            information and to check a visa holder&apos;s status online, visit the
            Department of Home Affairs website at{" "}
            <AtoLink href="homeaffairs.gov.au" />
          </IconRow>

          <div>
            <p className="font-bold text-gray-800 mb-1">
              Is your payee working under a working holiday visa (subclass 417) or
              a work and holiday visa (subclass 462)?
            </p>
            <p className="text-gray-800 leading-snug mb-1">
              Employers of workers under these two types of visa need to register
              with the ATO, see <AtoLink href="ato.gov.au/whmreg" />
            </p>
            <p className="text-gray-800 leading-snug">
              For the tax table &apos;working holiday maker&apos; visit our website
              at <AtoLink href="ato.gov.au/taxtables" />
            </p>
          </div>

          <div>
            <p className="font-bold text-gray-800 mb-1">Payer obligations</p>
            <p className="text-gray-800 leading-snug">
              If you withhold amounts from payments, or are likely to withhold
              amounts, the payee may give you this form with section A completed. A
              TFN declaration applies to payments made after the declaration is
              provided to you. The information provided on this form is used to
              determine the amount of tax to be withheld from payments based on the
              PAYG withholding tax tables we publish. If the payee gives you another
              declaration, it overrides any previous declarations.
            </p>
          </div>

          <div>
            <p className="font-bold text-gray-800 mb-1">
              Has your payee advised you that they have applied for a TFN, or
              enquired about their existing TFN?
            </p>
            <p className="text-gray-800 leading-snug">
              Where the payee indicates at question 1 on this form that they have
              applied for an individual TFN, or enquired about their existing TFN,
              they have 28 days to give you their TFN.{" "}
              <strong>
                You must withhold tax for 28 days at the standard rate according to
                the PAYG withholding tax tables.
              </strong>{" "}
              After 28 days, if the payee has not given you their TFN, you must
              then withhold the top rate of tax from future payments, unless we
              tell you not to.
            </p>
          </div>

          <div>
            <p className="font-bold text-gray-800 mb-1">
              If your payee has not given you a completed form you must:
            </p>
            <TfnBulletList
              items={[
                <>
                  notify us within 14 days of the start of the withholding
                  obligation by completing as much of the payee section of the form
                  as you can. Print &apos;PAYER&apos; in the payee declaration and
                  lodge the form – see &apos;Lodging the form&apos;.
                </>,
                "withhold the top rate of tax from any payment to that payee.",
              ]}
            />
          </div>

          <IconRow icon={<BlueArrowIcon />}>
            For a full list of tax tables, visit our website at{" "}
            <AtoLink href="ato.gov.au/taxtables" />
          </IconRow>
        </div>

        <div className="space-y-3">
          <h2 className="text-[28px] font-light text-gray-400">Lodging the form</h2>
          <p className="text-gray-800 leading-snug">
            You need to lodge TFN declarations with us within 14 days after the
            form is either signed by the payee or completed by you (if not provided
            by the payee).{" "}
            <strong>You need to retain a copy of the form for your records.</strong>{" "}
            For information about storage and disposal, see below.
          </p>

          <div>
            <p className="text-gray-800 leading-snug mb-1">You may lodge the information:</p>
            <TfnBulletList
              items={[
                <>
                  <strong>online</strong> – lodge your TFN declaration reports using
                  software that complies with our specifications. There is no need
                  to complete section B of each form as the payer information is
                  supplied by your software.
                </>,
                <>
                  <strong>by paper</strong> – complete section B and send the
                  original to us within 14 days.
                </>,
              ]}
            />
          </div>

          <IconRow icon={<BlueArrowIcon />}>
            For more information about lodging your TFN declaration report online,
            visit our website at <AtoLink href="ato.gov.au/lodgetfndeclaration" />
          </IconRow>

          <div>
            <p className="font-bold text-gray-800 mb-1">
              Provision of payee&apos;s TFN to the payee&apos;s super fund
            </p>
            <p className="text-gray-800 leading-snug">
              If you make a super contribution for your payee, you need to give
              your payee&apos;s TFN to their super fund on the day of contribution,
              or if the payee has not yet quoted their TFN, within 14 days of
              receiving this form from your payee.
            </p>
          </div>

          <div>
            <p className="font-bold text-gray-800 mb-1">
              Storing and disposing of TFN declarations
            </p>
            <p className="text-gray-800 leading-snug mb-1">
              The TFN Rule issued under the <em>Privacy Act 1988</em> requires a TFN
              recipient to use secure methods when storing and disposing of TFN
              information. You may store a paper copy of the signed form or
              electronic files of scanned forms. Scanned forms must be clear and not
              altered in any way.
            </p>
            <p className="text-gray-800 leading-snug mb-1">If a payee:</p>
            <TfnBulletList
              items={[
                <>
                  submits a new <em>TFN declaration</em> (NAT 3092), you must retain
                  a copy of the earlier form for the current and following financial
                  year.
                </>,
                "has not received payments from you for 12 months, you must retain a copy of the last completed form for the current and following financial year.",
              ]}
            />
          </div>

          <IconRow icon={<RedMinusIcon />}>
            <strong>Penalties</strong>
            <br />
            You may incur a penalty if you do not:
            <TfnBulletList
              className="mt-2"
              items={[
                "lodge TFN declarations with us",
                "keep a copy of completed TFN declarations for your records",
                "provide the payee's TFN to their super fund where the payee quoted their TFN to you.",
              ]}
            />
          </IconRow>
        </div>
      </div>

      <InstructionFooter page="6" leftText="Tax file number declaration" />
    </div>
  </TfnPage>
);

export default TfnPage6PayerInfo;
