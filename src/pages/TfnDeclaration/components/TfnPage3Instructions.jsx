import React from "react";
import {
  TfnPage,
  OrangeAlertIcon,
  BlueArrowIcon,
  IconRow,
  TfnBulletList,
  AtoLink,
} from "./TfnFormComponents";

const TfnPage3Instructions = () => (
  <TfnPage>
    <div className="px-8 pt-6 pb-3 flex-1 flex flex-col text-[12px]">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <p className="text-gray-900 mb-1">
              <span className="font-normal">Question 9 </span>
              <strong>Do you want to claim the tax-free threshold from this payer?</strong>
            </p>
            <p className="text-gray-800 leading-snug mb-2">
              The tax-free threshold is the amount of income you can earn each
              financial year that is not taxed. By claiming the threshold, you
              reduce the amount of tax that is withheld from your pay during the
              year.
            </p>
            <p className="text-gray-800 leading-snug mb-1">
              Answer <strong>yes</strong> if you want to claim the tax-free
              threshold, you are an Australian resident for tax purposes, and one
              of the following applies:
            </p>
            <TfnBulletList
              items={[
                "you are not currently claiming the tax-free threshold from another payer",
                "you are currently claiming the tax-free threshold from another payer and your total income from all sources will be less than the tax-free threshold.",
              ]}
            />
            <p className="text-gray-800 leading-snug mt-2">
              Answer <strong>yes</strong> if you are a foreign resident in
              receipt of an Australian Government pension or allowance.
            </p>
            <p className="text-gray-800 leading-snug mt-1">
              Answer <strong>no</strong> if none of the above applies or you are a
              working holiday maker.
            </p>
          </div>

          <IconRow icon={<OrangeAlertIcon />}>
            If you receive any taxable government payments or allowances, such as
            Newstart, Youth Allowance or Austudy payment, you are likely to be
            already claiming the tax-free threshold from that payment.
          </IconRow>

          <IconRow icon={<BlueArrowIcon />}>
            For more information about the current tax-free threshold, which payer
            you should claim it from, or how to vary your withholding rate, visit{" "}
            <AtoLink href="ato.gov.au/taxfreethreshold" />
          </IconRow>

          <div>
            <p className="text-gray-900 mb-1">
              <span className="font-normal">Question 10 </span>
              <strong>
                Do you have a Higher Education Loan Program (HELP), VET Student
                Loan (VSL), Financial Supplement (FS), Student Start-up Loan
                (SSL) or Trade Support Loan (TSL) debt?
              </strong>
            </p>
            <p className="text-gray-800 leading-snug">
              Answer <strong>yes</strong> if you have a HELP, VSL, FS, SSL or
              TSL debt.
            </p>
            <p className="text-gray-800 leading-snug mt-1">
              Answer <strong>no</strong> if you do not have a HELP, VSL, FS, SSL
              or TSL debt, or you have repaid your debt in full.
            </p>
          </div>

          <IconRow icon={<OrangeAlertIcon />}>
            <span>
              You have a HELP debt if either:
              <TfnBulletList
                className="mt-2"
                items={[
                  "the Australian Government lent you money under HECS-HELP, FEE-HELP, OS-HELP, VET FEE-HELP, VET Student loans prior to 1 July 2019 or SA-HELP",
                  "you have a debt from the previous Higher Education Contribution Scheme (HECS).",
                ]}
              />
              You have a SSL debt if you have an ABSTUDY SSL debt.
              <br />
              <br />
              You have a separate VSL debt that is not part of your HELP debt if
              you incurred it from 1 July 2019.
            </span>
          </IconRow>

          <IconRow icon={<BlueArrowIcon />}>
            For information about repaying your HELP, VSL, FS, SSL or TSL debt,
            visit <AtoLink href="ato.gov.au/getloaninfo" />
          </IconRow>
        </div>

        <div className="space-y-4">
          <div>
            <p className="font-bold text-gray-900 mb-1">
              Have you repaid your HELP, VSL, FS, SSL or TSL debt?
            </p>
            <p className="text-gray-800 leading-snug">
              When you have repaid your HELP, VSL, FS, SSL or TSL debt, you need
              to complete a <em>Withholding declaration</em> (NAT 3093) notifying
              your payer of the change in your circumstances.
            </p>
          </div>

          <IconRow icon={<OrangeAlertIcon />}>
            <strong>Sign and date the declaration</strong>
            <br />
            Make sure you have answered all the questions in section A, then sign
            and date the declaration. Give your completed declaration to your
            payer to complete section B.
          </IconRow>

          <div>
            <h2 className="text-[16px] font-bold text-gray-900 mb-2">
              Section B: To be completed by the payer
            </h2>
            <IconRow icon={<OrangeAlertIcon />} className="mb-3">
              Important information for payers – see the reverse side of the
              form.
            </IconRow>
            <IconRow icon={<BlueArrowIcon />}>
              <strong>Lodge online</strong>
              <br />
              Payers can lodge TFN declaration reports online if you have software
              that complies with our specifications. For more information about
              lodging the TFN declaration report online, visit{" "}
              <AtoLink href="ato.gov.au/lodgetfndeclaration" />
            </IconRow>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-gray-400 flex justify-between items-center pb-5">
        <span className="text-[12px] text-gray-700">Tax file number declaration</span>
        <span className="text-[12px] text-gray-700">3</span>
      </div>
    </div>
  </TfnPage>
);

export default TfnPage3Instructions;
