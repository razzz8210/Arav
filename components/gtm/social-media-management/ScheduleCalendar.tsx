import { useState, Dispatch, SetStateAction } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/app/styles/project/calendar.css";
import { useTab } from "@/utils/TabContext";
import ScheduleModal from "@/components/gtm/ScheduleModal";
import { toast } from "sonner";
import { useTemplate } from "@/utils/TemplateContext";
import { triggerSocialMediaRefetch } from "@/hooks/useSocialMediaRefetch";

interface ScheduleCalendarProps {
  modalTitle: string;
  modalSubtitle: string;
  setModalTitle: Dispatch<SetStateAction<string>>;
  setModalSubtitle: Dispatch<SetStateAction<string>>;
}

const ScheduleCalendar = ({
  modalTitle,
  modalSubtitle,
  setModalTitle,
  setModalSubtitle,
}: ScheduleCalendarProps) => {
  const [date, setDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date(2025, 7, 1));
  const [showModal, setShowModal] = useState(false);

  const {
    selectedTemplate,
    projectId,
    selectedPlatform,
    contentData,
    setSelectedTemplate,
    setPreviewType,
    setLastPreviewUrl,
  } = useTemplate();

  const { setActiveTab, setIsDraftSuccessModalOpen } = useTab();

  const getTemplateType = (type: string) => {
    if (type === "hook") return "Reel";
    if (type === "avatar") return "Avatar";
    if (type === "slideshow") return "Carousel";
    return "Post";
  };

  const handleSchedule = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first!");
      return;
    }

    try {
      const payload = {
        post_text: contentData.content,
        links: selectedTemplate.previewUrls,
        type:
          selectedTemplate.type === "hook" || selectedTemplate.type === "avatar"
            ? "video"
            : "image",
        platform: selectedPlatform,
        schedule_date: date.toISOString(),
        status: "scheduled",
        project_id: projectId,
      };

      const response = await fetch("/api/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unknown error");

      triggerSocialMediaRefetch();

      const templateType = getTemplateType(selectedTemplate.type || "");

      setModalTitle(`Your ${templateType} has been successfully scheduled!`);
      setModalSubtitle(
        `It will go live on ${formattedDate} at ${date.toLocaleTimeString()}. You can edit or reschedule it from your dashboard.`
      );
      setShowModal(false);
      setIsDraftSuccessModalOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error scheduling Posts"
      );
    }
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    setPreviewType(null);
    setLastPreviewUrl(null);
    setActiveTab("templates");
  };

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleDateClick = (value: any) => {
    if (value instanceof Date) {
      setDate(value);
      setActiveStartDate(new Date(value.getFullYear(), value.getMonth(), 1));
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = parseInt(e.target.value);
    const currentDate = date.getDate();
    const year = date.getFullYear();

    const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();
    const safeDate = Math.min(currentDate, daysInMonth);

    const newDate = new Date(year, selectedMonth, safeDate);
    setDate(newDate);
    setActiveStartDate(new Date(year, selectedMonth, 1)); // <-- This line forces calendar to view the correct month
  };

  return (
    <div className="border bg-[#DCDCDC] rounded-md border-[#272727] m-2">
      <div className="bg-[#EBEBEB] p-3">
        <div className="flex justify-between gap-2 items-center">
          <button
            className="w-[82px] items-center bg-[#DCDCDC] text-[#3C3C3C] flex justify-center h-[32px] cursor-pointer rounded-lg px-4 py-2"
            onClick={handleBack}
          >
            Back
          </button>
          <button
            className="w-[103px] h-[40px] cursor-pointer flex justify-center bg-[#9C7DFF] mr-2 text-white rounded-md px-4 py-2"
            onClick={handleSchedule}
          >
            Schedule
          </button>
        </div>
      </div>
      {/* Selected Date Display */}
      <div className="border border-[#272727] bg-[#DCDCDC] rounded-xl">
        <div className="rounded-xl border mt-2 bg-white mb-10 ml-10 mr-10">
          <div className="flex justify-between items-center">
            <div className="text-left ml-5 mt-4 text-lg font-semibold text-[#3C3C3C]">
              {formattedDate}
            </div>
            <div className="mr-5">
              <select
                className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-700"
                value={date.getMonth()}
                onChange={handleMonthChange}
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Calendar */}
          <div className="p-4 mt-2">
            <Calendar
              onChange={handleDateClick}
              value={date}
              activeStartDate={activeStartDate} // <-- Key fix
              showNeighboringMonth={true}
              showNavigation={false}
              tileContent={({ date: d }: { date: Date }) =>
                d.getDate() === date.getDate() &&
                d.getMonth() === date.getMonth() &&
                d.getFullYear() === date.getFullYear() ? (
                  <div className="dot" />
                ) : null
              }
              formatShortWeekday={(locale: any, date: Date) =>
                date
                  .toLocaleDateString(locale, { weekday: "short" })
                  .slice(0, 3)
              }
            />
          </div>
        </div>
      </div>
      {showModal && (
        <ScheduleModal
          autoFillSelectedDate={date}
          onClose={handleCloseModal}
          handleSchedule={handleSchedule}
        />
      )}
    </div>
  );
};

export default ScheduleCalendar;
