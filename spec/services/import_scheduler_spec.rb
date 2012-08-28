require 'spec_helper'

describe ImportScheduler do
  describe ".run" do
    let(:start_time) {Time.local(2012, 8, 22, 11, 0).to_datetime}
    let(:import_schedule) { import_schedules(:pending_import_schedule) }

    def expect_qc_enqueue
      mock(QC.default_queue).enqueue("Import.run", anything) do |method, import_id|
        Import.find(import_id).tap do |import|
          import.import_schedule.should == import_schedule
          import.workspace.should == import_schedule.workspace
          import.to_table.should == import_schedule.to_table
          import.source_dataset_id.should == import_schedule.source_dataset_id
          import.truncate.should == import_schedule.truncate
          import.user_id.should == import_schedule.user_id
          import.sample_count.should == import_schedule.sample_count
        end
      end
    end

    context "when next import time is set" do
      before do
        Timecop.freeze(start_time - 1.hour) do
          import_schedule.set_next_import
        end
        expect_qc_enqueue
      end

      context "when run before the end date" do
        around do |example|
          Timecop.freeze(start_time + 1.hour) do
            example.call
          end
        end

        it "enqueues a job to execute an import" do
          ImportScheduler.run
        end

        it "sets the last scheduled time" do
          ImportScheduler.run
          import_schedule.reload
          import_schedule.last_scheduled_at.should == Time.now
        end

        it "sets the next scheduled import" do
          ImportScheduler.run
          import_schedule.reload
          import_schedule.next_import_at.should == start_time + 1.day
        end
      end

      context "when run after the end date" do
        around do |example|
          Timecop.freeze(start_time + 1.year) do
            example.call
          end
        end

        it "enqueues the job" do
          ImportScheduler.run
        end

        it "sets the last scheduled time" do
          ImportScheduler.run
          import_schedule.reload
          import_schedule.last_scheduled_at.should == start_time + 1.year
        end

        it "does not schedule another import" do
          ImportScheduler.run
          import_schedule.reload
          import_schedule.next_import_at.should be_nil
        end
      end
    end

    #context "when no next import has been scheduled" do
    #  pending
    #end
  end
end
