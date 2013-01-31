class ReportsController < ApplicationController
  # GET /reports
  # GET /reports.json
  def index
    @reports = Report.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @reports }
    end
  end

  # GET /reports/1
  # GET /reports/1.json
  def show

    @report = Report.find_by("_id" => params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @report }
    end
  end

  # GET /reports/1/edit
  def edit
    @report = Report.find_by("_id" => params[:id], :user => User.find_by(:uuid => request.headers["Bitching-Client"]))
  end


  # POST /reports
  # POST /reports.json
  def create
    # JSON Example of a report post
    # Coordinates are [Longitute, Latitude]
    #{
    #"report":{
    #    "coordinates":[
    #    20.12,
    #    14
    #],
    #    "description":"vindo do curl!!!"
    #}}
    requested_uuid = request.headers["Bitching-Client"]

    if !requested_uuid.nil? && !requested_uuid.empty?
      @user = User.find_by(:uuid => requested_uuid)

      if @user.nil?
        @user = User.create!(:uuid => requested_uuid)
      end


      @report = Report.new()
      @report.description=params[:report][:description]
      @report.coordinates = [params[:report][:coordinates][0], params[:report][:coordinates][1]]
      @report.user = @user

      respond_to do |format|
        if @report.save
          #format.html { redirect_to @report, notice: 'Report was successfully created.' }
          format.json { render json: @report, status: :created, location: @report }
        else
          #format.html { render action: "new" }
          format.json { render json: @report.errors, status: :unprocessable_entity }
        end
      end
    end

  end

  # PUT /reports/1
  # PUT /reports/1.json
  def update
    @report = Report.find(params[:id])

    respond_to do |format|
      if @report.update_attributes(params[:report])
        # format.html { redirect_to @report, notice: 'Report was successfully updated.' }
        format.json { head :no_content }
      else
        #format.html { render action: "edit" }
        format.json { render json: @report.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /reports/1
  # DELETE /reports/1.json
  def destroy
    @report = Report.find(params[:id])
    @report.destroy

    respond_to do |format|
      #format.html { redirect_to reports_url }
      format.json { head :no_content }
    end
  end
end
