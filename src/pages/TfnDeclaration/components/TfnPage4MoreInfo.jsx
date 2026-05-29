import React from "react";
import { TfnPage, TfnBulletList, AtoLink } from "./TfnFormComponents";

const TfnPage4MoreInfo = () => (
  <TfnPage>
    <div className="px-8 pt-6 pb-3 flex-1 flex flex-col text-[11px]">
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900 mb-3">More information</h2>

          <p className="font-bold text-gray-900 mb-1">Internet</p>
          <TfnBulletList
            className="mb-3"
            items={[
              <>
                For general information about TFNs, tax and super in Australia,
                including how to deal with us online, visit our website at{" "}
                <AtoLink href="ato.gov.au" />
              </>,
              <>
                For information about applying for a TFN on the web, visit our
                website at <AtoLink href="ato.gov.au/tfn" />
              </>,
              <>
                For information about your super, visit our website at{" "}
                <AtoLink href="ato.gov.au/checkyoursuper" />
              </>,
            ]}
          />

          <p className="font-bold text-gray-900 mb-1">Useful products</p>
          <p className="text-gray-800 leading-snug mb-1">
            In addition to this TFN declaration, you may also need to complete
            and give your payer the following forms which you can download from
            our website at <AtoLink href="ato.gov.au" />:
          </p>
          <TfnBulletList
            className="mb-2"
            items={[
              <>
                <em>Medicare levy variation declaration</em> (NAT 0929), if you
                qualify for a reduced rate of Medicare levy or are liable for the
                Medicare levy surcharge. You can vary the amount your payer
                withholds from your payments.
              </>,
              <>
                <em>Standard choice form</em> (NAT 13080) to choose a super fund
                for your employer to pay super contributions to. You can find
                information about your current super accounts and transfer any
                unnecessary super accounts through myGov after you have linked to
                the ATO. Temporary residents should visit{" "}
                <AtoLink href="ato.gov.au/departaustralia" /> for more information
                about super.
              </>,
            ]}
          />
          <p className="text-gray-800 leading-snug">
            Other forms and publications are also available from our website at{" "}
            <AtoLink href="ato.gov.au/onlineordering" /> or by phoning{" "}
            <strong>1300 720 092</strong>.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-900 mb-1">Phone</p>
          <TfnBulletList
            className="mb-2"
            items={[
              <>
                Payee – for more information, phone <strong>13 28 61</strong>{" "}
                between 8.00am and 6.00pm, Monday to Friday. If you want to vary
                your rate of withholding, phone <strong>1300 360 221</strong>{" "}
                between 8.00am and 6.00pm, Monday to Friday.
              </>,
              <>
                Payer – for more information, phone <strong>13 28 66</strong>{" "}
                between 8.00am and 6.00pm, Monday to Friday.
              </>,
            ]}
          />
          <p className="text-gray-800 leading-snug mb-2">
            If you phone, we need to know we&apos;re talking to the right person
            before we can discuss your tax affairs. We&apos;ll ask for details
            only you, or someone you&apos;ve authorised, would know. An authorised
            contact is someone you&apos;ve previously told us can act on your
            behalf.
          </p>
          <p className="text-gray-800 leading-snug mb-2">
            If you do not speak English well and need help from the ATO, phone the
            Translating and Interpreting Service on <strong>13 14 50</strong>.
          </p>
          <p className="text-gray-800 leading-snug mb-1">
            If you are deaf, or have a hearing or speech impairment, phone the ATO
            through the National Relay Service (NRS) on the numbers listed below:
          </p>
          <TfnBulletList
            className="mb-2"
            items={[
              <>
                TTY users – phone <strong>13 36 77</strong> and ask for the ATO
                number you need (if you are calling from overseas, phone{" "}
                <strong>+61 7 3815 7799</strong>)
              </>,
              <>
                Speak and Listen (speech-to-speech relay) users – phone{" "}
                <strong>1300 555 727</strong> and ask for the ATO number you need
                (if you are calling from overseas, phone{" "}
                <strong>+61 7 3815 8000</strong>)
              </>,
              <>
                Internet relay users – connect to the NRS on{" "}
                <AtoLink href="relayservice.gov.au" /> and ask for the ATO number
                you need.
              </>,
            ]}
          />
          <p className="text-gray-800 leading-snug mb-3">
            If you would like further information about the National Relay
            Service, phone <strong>1800 555 660</strong> or email{" "}
            <a
              href="mailto:helpdesk@relayservice.com.au"
              className="font-bold cursor-pointer hover:underline hover:text-[#009FDA]"
            >
              helpdesk@relayservice.com.au
            </a>
          </p>

          <p className="font-bold text-gray-900 mb-1">Privacy of information</p>
          <p className="text-gray-800 leading-snug">
            Taxation law authorises the ATO to collect information and to disclose
            it to other government agencies. For information about your privacy,
            go to <AtoLink href="ato.gov.au/privacy" />
          </p>
        </div>
      </div>

      <div className="border-t border-gray-400 pt-4 grid grid-cols-2 gap-6">
        <div>
          <p className="text-[12px] font-bold text-gray-900 mb-2">
            Our commitment to you
          </p>
          <p className="text-[10px] text-gray-700 leading-snug mb-2">
            We are committed to providing you with accurate, consistent and clear
            information to help you understand your rights and entitlements and meet
            your obligations.
          </p>
          <p className="text-[10px] text-gray-700 leading-snug mb-2">
            If you follow our information in this publication and it turns out to
            be incorrect, or it is misleading and you make a mistake as a result,
            we must still apply the law correctly. If that means you owe us money,
            we must ask you to pay it but we will not charge you a penalty. Also,
            if you acted reasonably and in good faith we will not charge you
            interest.
          </p>
          <p className="text-[10px] text-gray-700 leading-snug mb-2">
            If you make an honest mistake in trying to follow our information in
            this publication and you owe us money as a result, we will not charge
            you a penalty. However, we will ask you to pay the money, and we may
            also charge you interest. If correcting the mistake means we owe you
            money, we will pay it to you. We will also pay you any interest you
            are entitled to.
          </p>
          <p className="text-[10px] text-gray-700 leading-snug mb-2">
            If you feel that this publication does not fully cover your
            circumstances, or you are unsure how it applies to you, you can seek
            further assistance from us.
          </p>
          <p className="text-[10px] text-gray-700 leading-snug mb-2">
            We regularly revise our publications to take account of any changes to
            the law, so make sure that you have the latest information. If you are
            unsure, you can check for more recent information on our website at{" "}
            <AtoLink href="ato.gov.au" /> or contact us.
          </p>
          <p className="text-[10px] text-gray-700 leading-snug">
            This publication was current at <strong>June 2019</strong>.
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-700 leading-snug mb-2">
            <strong>
              © Australian Taxation Office for the Commonwealth of Australia, 2019
            </strong>
          </p>
          <p className="text-[10px] text-gray-700 leading-snug mb-3">
            You are free to copy, adapt, modify, transmit and distribute this
            material as you wish (but not in any way that suggests the ATO or the
            Commonwealth endorses you or any of your services or products).
          </p>
          <p className="text-[12px] font-bold text-gray-900 mb-1">Published by</p>
          <p className="text-[10px] text-gray-700">Australian Taxation Office</p>
          <p className="text-[10px] text-gray-700">Canberra</p>
          <p className="text-[10px] text-gray-700">June 2019</p>
          <p className="text-[10px] text-gray-500 mt-2">DE-6078</p>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-gray-400 flex justify-between items-center pb-5">
        <span className="text-[12px] text-gray-700">4</span>
        <span className="text-[12px] text-gray-700">Tax file number declaration</span>
      </div>
    </div>
  </TfnPage>
);

export default TfnPage4MoreInfo;
