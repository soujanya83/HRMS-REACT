import React, { useState } from "react";
import topImage from "../../assets/common_form_images/img9.jpg";
import bottomImage from "../../assets/common_form_images/img11.jpg";

export const initialStaffRecordState = {
  name: "",
  dateOfBirth: "",
  email: "",
  mobileNumber: "",
  address: "",
  relevantQualifications: "",
  relevantQualificationsCopiesAttached: false,
  otherApprovedTraining: "",
  otherApprovedTrainingCopiesAttached: false,
  workingWithChildrenCheckNumber: "",
  certifiedSupervisorNumber: "",
  statusCheckCompletedDate: "",
};

const StaffRecordForm = () => {
  const [formData, setFormData] = useState(initialStaffRecordState);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const inputClass =
    "w-full h-full bg-transparent px-3 py-1 text-[15px] text-gray-900 outline-none focus:bg-blue-50/40";
  const textareaClass =
    "w-full h-full resize-none bg-transparent px-3 py-2 text-[15px] leading-snug text-gray-900 outline-none focus:bg-blue-50/40";
  const borderClass = "border border-[#3f3f3f]";
  const labelClass = "text-[16px] leading-snug text-black";

  return (
    <div className="min-h-screen overflow-x-auto bg-gray-200 py-10 px-4 print:bg-white print:py-0">
      <form className="relative mx-auto h-[794px] w-[1223px] bg-white shadow-lg overflow-hidden print:shadow-none">
        <img
          src={topImage}
          alt=""
          className="absolute left-0 top-0 block h-[127px] w-full object-cover"
          draggable={false}
        />
        <img
          src={bottomImage}
          alt=""
          className="absolute bottom-0 left-0 block h-[136px] w-full object-cover"
          draggable={false}
        />

        <div className="absolute left-[103px] top-[132px] w-[917px]">
          <h1 className="mb-[18px] text-center text-[25px] font-bold leading-none text-black">
            Staff Record
          </h1>

          <div className={`w-full ${borderClass}`}>
            <div className={`h-[35px] ${borderClass} border-t-0 border-x-0 flex items-center px-3`}>
              <p className="text-[16px] font-bold text-black">
                Educators and other staff:
              </p>
            </div>

            <div className="grid h-[38px] grid-cols-[224px_372px_160px_161px]">
              <label className={`${borderClass} border-l-0 border-t-0 flex items-center px-3 ${labelClass}`}>
                Name
              </label>
              <div className={`${borderClass} border-t-0`}>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className={inputClass}
                  aria-label="Name"
                />
              </div>
              <label className={`${borderClass} border-t-0 flex items-center px-3 ${labelClass}`}>
                Date of birth
              </label>
              <div className={`${borderClass} border-r-0 border-t-0`}>
                <input
                  type="text"
                  value={formData.dateOfBirth}
                  onChange={(event) => updateField("dateOfBirth", event.target.value)}
                  className={inputClass}
                  aria-label="Date of birth"
                />
              </div>
            </div>

            <div className="grid h-[38px] grid-cols-[224px_372px_160px_161px]">
              <label className={`${borderClass} border-l-0 border-t-0 flex items-center px-3 ${labelClass}`}>
                Email
              </label>
              <div className={`${borderClass} border-t-0`}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className={inputClass}
                  aria-label="Email"
                />
              </div>
              <label className={`${borderClass} border-t-0 flex items-center px-3 ${labelClass}`}>
                Mobile Number
              </label>
              <div className={`${borderClass} border-r-0 border-t-0`}>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(event) => updateField("mobileNumber", event.target.value)}
                  className={inputClass}
                  aria-label="Mobile Number"
                />
              </div>
            </div>

            <div className="grid h-[38px] grid-cols-[224px_1fr]">
              <label className={`${borderClass} border-l-0 border-t-0 flex items-center px-3 ${labelClass}`}>
                Address
              </label>
              <div className={`${borderClass} border-r-0 border-t-0`}>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  className={inputClass}
                  aria-label="Address"
                />
              </div>
            </div>

            <div className="grid h-[111px] grid-cols-[224px_492px_201px]">
              <label className={`${borderClass} border-l-0 border-t-0 px-3 py-3 ${labelClass}`}>
                <span>Relevant qualifications/s, or</span>
                <br />
                <span className="block mt-4">course enrolled in</span>
              </label>
              <div className={`${borderClass} border-t-0`}>
                <textarea
                  value={formData.relevantQualifications}
                  onChange={(event) =>
                    updateField("relevantQualifications", event.target.value)
                  }
                  className={textareaClass}
                  aria-label="Relevant qualifications or course enrolled in"
                />
              </div>
              <label className={`${borderClass} border-r-0 border-t-0 flex items-start justify-between gap-4 px-4 py-3 ${labelClass}`}>
                <span className="whitespace-nowrap">Copies attached</span>
                <input
                  type="checkbox"
                  checked={formData.relevantQualificationsCopiesAttached}
                  onChange={(event) =>
                    updateField(
                      "relevantQualificationsCopiesAttached",
                      event.target.checked
                    )
                  }
                  className="mt-0 h-[30px] w-[30px] shrink-0 appearance-none border border-[#3f3f3f] bg-white checked:bg-gray-700"
                  aria-label="Relevant qualifications copies attached"
                />
              </label>
            </div>

            <div className="grid h-[111px] grid-cols-[224px_492px_201px]">
              <label className={`${borderClass} border-l-0 border-t-0 px-3 py-3 ${labelClass}`}>
                Other approved training completed
              </label>
              <div className={`${borderClass} border-t-0`}>
                <textarea
                  value={formData.otherApprovedTraining}
                  onChange={(event) =>
                    updateField("otherApprovedTraining", event.target.value)
                  }
                  className={textareaClass}
                  aria-label="Other approved training completed"
                />
              </div>
              <label className={`${borderClass} border-r-0 border-t-0 flex items-start justify-between gap-4 px-4 py-3 ${labelClass}`}>
                <span className="whitespace-nowrap">Copies attached</span>
                <input
                  type="checkbox"
                  checked={formData.otherApprovedTrainingCopiesAttached}
                  onChange={(event) =>
                    updateField(
                      "otherApprovedTrainingCopiesAttached",
                      event.target.checked
                    )
                  }
                  className="mt-0 h-[30px] w-[30px] shrink-0 appearance-none border border-[#3f3f3f] bg-white checked:bg-gray-700"
                  aria-label="Other approved training copies attached"
                />
              </label>
            </div>

            <div className="grid h-[166px] grid-cols-[224px_372px_160px_161px]">
              <label className={`${borderClass} border-l-0 border-y-0 px-3 py-4 ${labelClass}`}>
                Identification number of relevant
                <br />
                working with children check or
                <br />
                working with vulnerable people
                <br />
                check
              </label>
              <div className="grid grid-rows-[83px_83px]">
                <div className={`${borderClass} border-t-0`}>
                  <textarea
                    value={formData.workingWithChildrenCheckNumber}
                    onChange={(event) =>
                      updateField(
                        "workingWithChildrenCheckNumber",
                        event.target.value
                      )
                    }
                    className={textareaClass}
                    aria-label="Identification number of relevant check"
                  />
                </div>
                <div className={`${borderClass} border-b-0`}>
                  <label className={`${labelClass} block px-3 py-3`}>
                    Date of status check completed{" "}
                    <em>(to be done monthly here after)</em>
                  </label>
                  <input
                    type="text"
                    value={formData.statusCheckCompletedDate}
                    onChange={(event) =>
                      updateField("statusCheckCompletedDate", event.target.value)
                    }
                    className={`${inputClass} -mt-2 h-[34px]`}
                    aria-label="Date of status check completed"
                  />
                </div>
              </div>
              <label className={`${borderClass} border-y-0 px-3 py-4 ${labelClass}`}>
                Certified Supervisor
                <br />
                number
                <br />
                <br />
                <em>(if applicable)</em>
              </label>
              <div className={`${borderClass} border-r-0 border-y-0`}>
                <textarea
                  value={formData.certifiedSupervisorNumber}
                  onChange={(event) =>
                    updateField("certifiedSupervisorNumber", event.target.value)
                  }
                  className={textareaClass}
                  aria-label="Certified Supervisor number"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute left-0 top-[715px] w-full text-center text-[12px] leading-[1.75] text-[#8b8b8b]">
          <p>ABN: 36 602 053 412</p>
          <p>1 Capricorn Road, Truganina, VIC 3029.</p>
        </div>
      </form>
    </div>
  );
};

export default StaffRecordForm;
