// components/ScheduleModal.tsx or your relevant file

import { FC, useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css"; // Don't forget to import the styles
import { format } from "date-fns";
import DraftSuccessModal from "@/components/ui/DraftSuccessModal";
import { useTemplate } from "@/utils/TemplateContext";
import { useTab } from "@/utils/TabContext";
import { toast } from "sonner";

interface ScheduleModalProps {
  autoFillSelectedDate?: Date;
  onClose: () => void;
  handleSchedule: () => void;
}

const ScheduleModal: FC<ScheduleModalProps> = ({
  onClose,
  autoFillSelectedDate,
  handleSchedule,
}) => {
  const {
    setIsDraftSuccessModalOpen,
    setActiveTab,
    setIsChatOpen,
    setIsCaptionsOpen,
  } = useTab();

  const { setSelectedTemplate, setLastPreviewUrl, setPreviewType } =
    useTemplate();

  // State for managing date, time, and calendar visibility
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [timeValue, setTimeValue] = useState("");
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (autoFillSelectedDate) {
      setSelectedDate(autoFillSelectedDate);
    }
  }, [autoFillSelectedDate]);

  // Handler for when a date is selected from the calendar
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setCalendarOpen(false); // Close the calendar after selection
  };

  // Handler for the time input field
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // You can add validation here if needed
    setTimeValue(e.target.value);
  };

  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center flex-col bg-white/80 backdrop-blur-sm">
      {/* Modal panel */}
      <div className="bg-white text-gray-900 rounded-lg p-8 max-w-sm w-full shadow-xl">
        {/* Back button */}
        <button
          onClick={onClose}
          className="mb-4 text-gray-600 cursor-pointer hover:text-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-center mb-6">
          Schedule Your Post
        </h2>

        <div className="space-y-4">
          {/* Schedule Date */}
          <div>
            <label
              htmlFor="scheduleDate"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Schedule Date
            </label>
            <div className="relative">
              <input
                type="text"
                id="scheduleDate"
                readOnly
                onClick={() => setCalendarOpen(!isCalendarOpen)}
                value={selectedDate ? format(selectedDate, "dd-MM-yyyy") : ""}
                placeholder="dd-mm-yyyy"
                className="w-full  border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-gray-600 cursor-pointer"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
              {isCalendarOpen && (
                <div className="absolute top-full mt-2 z-10">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="bg-white border border-gray-200 rounded-md shadow-lg"
                    classNames={{
                      caption: "flex justify-center items-center h-10",
                      head_cell:
                        "w-10 h-10 font-semibold text-sm text-gray-600",
                      cell: "w-10 h-10",
                      day: "w-10 h-10 rounded-full hover:bg-gray-100",
                      day_selected:
                        "bg-purple-600 text-white hover:bg-purple-600",
                      day_today: "font-bold text-purple-600",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="scheduleTime"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Schedule Time
            </label>
            <div className="relative">
              <input
                required={true}
                type="time"
                id="scheduleTime"
                value={timeValue}
                onChange={handleTimeChange}
                className={`w-full border ${
                  timeValue === "" ? "border-red-500" : "border-gray-300"
                } rounded-md py-2 pl-4 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-600 time-input`}
              />

              {/* <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span> */}
            </div>
          </div>
        </div>

        {/* Schedule Button */}
        <button
          className="w-full cursor-pointer bg-[#9C7DFF] hover:bg-[#9278e7] text-white font-bold py-3 px-4 rounded-lg mt-8 transition duration-300"
          onClick={handleSchedule}
        >
          Schedule
        </button>
      </div>

      {isSuccessModalOpen && (
        <DraftSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleCloseModal}
          handleViewDrafts={() => {
            setIsDraftSuccessModalOpen(false);
            setSelectedTemplate(null);
            setIsChatOpen(false);
            setIsCaptionsOpen(false);
            setActiveTab("social-media-management");
          }}
          handleDashboard={() => {
            setIsDraftSuccessModalOpen(false);
            setSelectedTemplate(null);
            setPreviewType(null);
            setLastPreviewUrl(null);
            setIsChatOpen(false);
            setActiveTab("templates");
          }}
          title="Your Reel has been successfully scheduled!"
          subtitle="It will go live on [Date] at [Time]. You can edit or reschedule it from your dashboard."
          primaryText=" Edit Schedule"
          secondaryText="View Scheduled Posts"
        />
      )}
    </div>
  );
};

export default ScheduleModal;
