import React from "react";
import {
  TfnPage,
  RedMinusIcon,
  BlueArrowIcon,
  IconRow,
  TfnBulletList,
  AtoLink,
} from "./TfnFormComponents";

const TfnPage2Instructions = () => (
  <TfnPage>
    <div className="px-8 pt-6 pb-3 flex-1 flex flex-col text-[12px]">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-[14px] font-semibold text-gray-900">
            Section A: To be completed by the payee
          </h2>

          <div>
            <p className="font-bold text-gray-900 mb-1">
              Question 1: What is your tax file number (TFN)?
            </p>
            <p className="text-gray-800 leading-snug">
              You need to give your TFN to your payer:
            </p>
            <TfnBulletList
              className="mt-1"
              items={[
                "to prevent tax being withheld at the top marginal rate, plus Medicare levy and Medicare levy surcharge",
                "to make sure your superannuation contributions are not taxed at a higher rate.",
              ]}
            />
          </div>

          <IconRow icon={<RedMinusIcon />}>
            Under the <em>Taxation Administration Act 1953</em>, it is an
            offence for you to fail to quote your TFN to your payer when
            requested, or to quote a false or misleading TFN. If you do not
            provide your TFN when requested, your payer must withhold tax from
            your pay at the top marginal rate, plus the Medicare levy and the
            Medicare levy surcharge.
          </IconRow>

          <div>
            <p className="font-bold text-gray-900 mb-1">How do you find your TFN?</p>
            <TfnBulletList
              items={[
                "on your income tax notice of assessment",
                "on a payment summary (provided by your payer)",
                "on a statement of account from your superannuation fund",
                <>
                  by phoning us on <strong>13 28 61</strong> between 8.00am and
                  6.00pm, Monday to Friday.
                </>,
              ]}
            />
          </div>

          <div>
            <p className="font-bold text-gray-900 mb-1">You don&apos;t have a TFN</p>
            <p className="text-gray-800 leading-snug">
              If you don&apos;t have a TFN, apply for one at{" "}
              <AtoLink href="ato.gov.au/tfn" /> or phone <strong>13 28 61</strong>.
            </p>
          </div>

          <div>
            <p className="font-bold text-gray-900 mb-1">
              You may be able to claim an exemption from quoting your TFN
            </p>
            <p className="text-gray-800 leading-snug mb-1">
              Print <strong>X</strong> in the appropriate box on page 5 if you are
              claiming an exemption because:
            </p>
            <TfnBulletList
              items={[
                <>
                  you are lodging a separate application for a new or existing
                  TFN with us – you have <strong>28 days</strong> to give your TFN
                  to your payer. Your payer must withhold tax for 28 days at the
                  standard rate. After 28 days, if you have not given your TFN,
                  your payer must withhold the top rate of tax from future
                  payments
                </>,
                "you are under 18 years of age and do not earn enough to pay tax",
                <>
                  you are claiming a pension, benefit or allowance exemption –
                  for example, from the Department of Human Services or the
                  Department of Veterans&apos; Affairs
                </>,
              ]}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="font-bold text-gray-900 mb-1">
              Providing your TFN to your super fund
            </p>
            <p className="text-gray-800 leading-snug mb-1">
              Your payer must give your TFN to your super fund if you have
              provided it. This means:
            </p>
            <TfnBulletList
              items={[
                "your super fund can accept your employer's contributions",
                "you can make personal contributions to your super fund",
                "your super fund can accept rollovers from other super funds",
                "your super fund can accept eligible termination payments.",
              ]}
            />
          </div>

          <IconRow icon={<BlueArrowIcon />}>
            For more information about providing your TFN to your super fund,
            visit <AtoLink href="ato.gov.au/supereligibility" />
          </IconRow>

          <div>
            <p className="font-bold text-gray-900 mb-1">Questions 2–6</p>
            <p className="text-gray-800 leading-snug">
              Complete these questions with your personal information.
            </p>
          </div>

          <div>
            <p className="font-bold text-gray-900 mb-1">
              Question 7: On what basis are you paid?
            </p>
            <p className="text-gray-800 leading-snug">
              Check with your payer if you are not sure.
            </p>
          </div>

          <div>
            <p className="font-bold text-gray-900 mb-1">
              Question 8: Are you an Australian resident for tax purposes or a
              working holiday maker?
            </p>
            <p className="text-gray-800 leading-snug mb-1">
              Generally, you are an Australian resident for tax purposes if you:
            </p>
            <TfnBulletList
              items={[
                "live in Australia and are not a foreign resident",
                "have always lived in Australia or have come to Australia and live here permanently",
                "are an overseas student enrolled in a course of study in Australia for more than six months",
                "have migrated to Australia and intend to live here permanently.",
              ]}
            />
            <p className="text-gray-800 leading-snug mt-2 mb-1">
              You are a working holiday maker if you have a visa subclass 417
              (Working Holiday) or 462 (Work and Holiday).
            </p>
            <IconRow icon={<BlueArrowIcon />}>
              For more information, visit <AtoLink href="ato.gov.au/whm" />
            </IconRow>
            <p className="text-gray-800 leading-snug mt-2">
              If you are a temporary resident and you leave Australia permanently,
              you may be able to claim your super. For more information, visit{" "}
              <AtoLink href="ato.gov.au/departaustralia" />
            </p>
          </div>

          <IconRow icon={<RedMinusIcon />}>
            <strong>Foreign resident tax rates are different</strong> – if you
            are a foreign resident for tax purposes, your payer must withhold tax
            at a higher rate. Foreign residents cannot claim the tax-free
            threshold and may not be entitled to certain tax offsets.
          </IconRow>

          <IconRow icon={<BlueArrowIcon />}>
            For more information about residency for tax purposes, visit{" "}
            <AtoLink href="ato.gov.au/residency" />
          </IconRow>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-gray-400 flex justify-between items-center pb-5">
        <span className="text-[12px] text-gray-700">2</span>
        <span className="text-[12px] text-gray-700">Tax file number declaration</span>
      </div>
    </div>
  </TfnPage>
);

export default TfnPage2Instructions;
